from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.question import QuestionCreate, QuestionResponse
from app.repositories import question_repo
from app.models.user import User
from app.routers.auth_router import get_current_user

router = APIRouter(prefix="/questions", tags=["Questions"])

@router.post("/", response_model=QuestionResponse)
def create_question(question: QuestionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return question_repo.create_question(db=db, question=question, user_id=current_user.id)

@router.get("/", response_model=List[QuestionResponse])
def get_all_questions(db: Session = Depends(get_db)):
    return question_repo.get_all_questions(db)

@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    question = question_repo.get_question_by_id(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Soru bulunamadı")
    if question.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Yetkiniz yok")
    question_repo.delete_question(db, question_id)
    return None
@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Soruyu bul
    question = question_repo.get_question_by_id(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Soru bulunamadı")
    
    # 2. Silmeye çalışan kişi, sorunun sahibi mi?
    if question.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu soruyu silmeye yetkiniz yok!")
    
    # 3. Sil
    question_repo.delete_question(db, question_id)
    return None