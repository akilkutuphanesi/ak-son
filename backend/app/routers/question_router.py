from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
import uuid 
import cloudinary
import cloudinary.uploader

from app.core.database import get_db
from app.schemas.question import QuestionResponse, QuestionCreate
from app.repositories import question_repo
from app.models.user import User
from app.routers.auth_router import get_current_user

# --- İŞTE BU SATIR EKSİK OLABİLİR, BUNU MUTLAKAEKLE ---
router = APIRouter(prefix="/questions", tags=["Questions"])
# ------------------------------------------------------
# Cloudinary yapılandırmasını kuruyoruz (Bilgileri .env'den otomatik okuyacak)
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# --- RESİM YÜKLEME VE SORU OLUŞTURMA ---
@router.post("/", response_model=QuestionResponse)
def create_question(
    title: str = Form(...),    
    content: str = Form(...),  
    image: UploadFile = File(None), 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    image_url = None
    
    if image:
        # Resmi Cloudinary'e yükle (akil_kutuphanesi isimli bir klasör oluşturur)
        result = cloudinary.uploader.upload(image.file, folder="akil_kutuphanesi")
        
        # Cloudinary'nin bize verdiği o güvenli ve kalıcı linki al (https:// ile başlar)
        image_url = result.get("secure_url")


    # Veriyi bir obje paketine koyuyoruz
    question_data = QuestionCreate(title=title, content=content)
    
    return question_repo.create_question(
        db=db, 
        question=question_data, 
        user_id=current_user.id,
        image_url=image_url
    )

@router.get("/", response_model=List[QuestionResponse])
def get_all_questions(db: Session = Depends(get_db)):
    return question_repo.get_all_questions(db)

@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(question_id: int, db: Session = Depends(get_db)):
    question = question_repo.get_question_by_id(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Soru bulunamadı")
    return question

@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    question = question_repo.get_question_by_id(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Soru bulunamadı")
    if question.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Yetkiniz yok")
    question_repo.delete_question(db, question_id)
    return None