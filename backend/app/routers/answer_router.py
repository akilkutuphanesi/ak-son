from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.answer import AnswerCreate, AnswerResponse
from app.repositories import answer_repo, question_repo, notification_repo
from app.models.user import User
from app.routers.auth_router import get_current_user

router = APIRouter(prefix="/answers", tags=["Answers"])

@router.post("/", response_model=AnswerResponse)
def create_new_answer(
    answer: AnswerCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Cevabı veritabanına kaydet
    new_answer = answer_repo.create_answer(db=db, answer=answer, user_id=current_user.id)
    
    # 2. Cevap verilen soruyu bul (Başlığını ve sahibini öğrenmek için)
    question = question_repo.get_question_by_id(db, answer.question_id)
    
    # --- İŞTE BURAYA YAPIŞTIRIYORSUN ---
    # 3. BİLDİRİM GÖNDER (Eğer cevap yazan kişi sorunun sahibi DEĞİLSE)
    if question and question.owner_id != current_user.id:
        # Kullanıcının mail adresinden ismini türetelim (örn: ahmet.yilmaz)
        sender_name = current_user.email.split('@')[0] 
        message = f"{sender_name} '{question.title}' başlıklı sorunuza cevap verdi!"
        
        notification_repo.create_notification(db, user_id=question.owner_id, content=message)
    # ----------------------------------
            
    return new_answer

# ... (Diğer get ve delete fonksiyonları aynen kalacak) ...
@router.get("/question/{question_id}", response_model=List[AnswerResponse])
def get_question_answers(question_id: int, db: Session = Depends(get_db)):
    return answer_repo.get_answers_by_question(db, question_id=question_id)

@router.delete("/{answer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_answer(
    answer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    answer = answer_repo.get_answer_by_id(db, answer_id)
    if not answer:
        raise HTTPException(status_code=404, detail="Cevap bulunamadı")
    if answer.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu cevabı silmeye yetkiniz yok!")
    answer_repo.delete_answer(db, answer_id)
    return None

@router.get("/me", response_model=List[AnswerResponse])
def get_my_answers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return answer_repo.get_answers_by_owner(db, user_id=current_user.id)