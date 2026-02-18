from sqlalchemy.orm import Session, joinedload  # <-- joinedload ÖNEMLİ
from app.models.answer import Answer
from app.schemas.answer import AnswerCreate

# Cevap oluştur
def create_answer(db: Session, answer: AnswerCreate, user_id: int):
    db_answer = Answer(
        content=answer.content,
        question_id=answer.question_id,
        owner_id=user_id
    )
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    return db_answer

# Bir soruya ait cevapları getir
def get_answers_by_question(db: Session, question_id: int):
    return db.query(Answer).options(joinedload(Answer.owner)).filter(Answer.question_id == question_id).all()

# Tek bir cevabı ID ile getir
def get_answer_by_id(db: Session, answer_id: int):
    return db.query(Answer).filter(Answer.id == answer_id).first()

# Cevabı sil
def delete_answer(db: Session, answer_id: int):
    db.query(Answer).filter(Answer.id == answer_id).delete()
    db.commit()

# --- BURASI DÜZELTİLDİ ---
# Kullanıcının cevaplarını getirirken SORUYU da (Answer.question) yükle
def get_answers_by_owner(db: Session, user_id: int):
    return db.query(Answer)\
        .options(joinedload(Answer.question))\
        .filter(Answer.owner_id == user_id)\
        .all()