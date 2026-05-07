from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.answer import AnswerCreate, AnswerResponse
from app.repositories import answer_repo, question_repo, notification_repo, user_repo
from app.models.user import User
from app.routers.auth_router import get_current_user

router = APIRouter(prefix="/answers", tags=["Answers"])

@router.post("/", response_model=AnswerResponse)
def create_new_answer(answer: AnswerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Soru var mı?
    question = question_repo.get_question_by_id(db, answer.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Soru bulunamadı")
    
    # 2. Cevabı kaydet
    db_answer = answer_repo.create_answer(db=db, answer=answer, user_id=current_user.id)
    
    # 3. Bildirim oluştur
    if question.owner_id != current_user.id:
        # Kullanıcının görünen adı varsa onu, yoksa mail'in baş kısmını kullan
        sender_name = current_user.display_name or current_user.email.split('@')[0]
        message = f"{sender_name} sorunuza cevap yazdı."
        # ID'yi gönderiyoruz
        notification_repo.create_notification(db, user_id=question.owner_id, content=message, question_id=question.id)
        
    return db_answer

@router.post("/{answer_id}/accept", response_model=AnswerResponse)
def accept_best_answer(answer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    answer = answer_repo.get_answer_by_id(db, answer_id)
    if not answer:
        raise HTTPException(status_code=404, detail="Cevap bulunamadı")
        
    question = question_repo.get_question_by_id(db, answer.question_id)
    if question.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sadece sorunun sahibi en iyi cevabı seçebilir")
        
    # Unmark any existing best answers for this question
    for ans in question.answers:
        if ans.is_best_answer:
            ans.is_best_answer = False
            
    # Mark the new one
    answer.is_best_answer = True
    db.commit()
    db.refresh(answer)
    
    # Bildirim
    if answer.owner_id != current_user.id:
        sender_name = current_user.display_name or current_user.email.split('@')[0]
        message = f"{sender_name} cevabınızı 'En İyi Cevap' olarak seçti! 🎉"
        notification_repo.create_notification(db, user_id=answer.owner_id, content=message, question_id=question.id)
        
    return answer

@router.get("/me", response_model=List[AnswerResponse])
def get_my_answers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return answer_repo.get_answers_by_owner(db, user_id=current_user.id)

@router.get("/question/{question_id}", response_model=List[AnswerResponse])
def get_answers_by_question(question_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return answer_repo.get_answers_by_question(db, question_id)

from app.schemas.answer import AnswerUpdate

@router.patch("/{answer_id}", response_model=AnswerResponse)
def update_answer(
    answer_id: int, 
    update_data: AnswerUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    answer = answer_repo.get_answer_by_id(db, answer_id)
    if not answer:
        raise HTTPException(status_code=404, detail="Cevap bulunamadı")
    if answer.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu cevabı güncelleme yetkiniz yok")
    
    return answer_repo.update_answer(db, answer, update_data)

@router.delete("/{answer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_answer(answer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    answer = answer_repo.get_answer_by_id(db, answer_id)
    if not answer:
        raise HTTPException(status_code=404, detail="Cevap bulunamadı")
        
    question = question_repo.get_question_by_id(db, answer.question_id)
    
    if answer.owner_id != current_user.id and question.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu cevabı silmeye yetkiniz yok")
        
    answer_repo.delete_answer(db, answer_id)
    return None