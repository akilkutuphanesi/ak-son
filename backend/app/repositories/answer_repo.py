from sqlalchemy.orm import Session, joinedload
from app.models.answer import Answer

def create_answer(db: Session, answer, user_id: int):
    db_answer = Answer(content=answer.content, question_id=answer.question_id, owner_id=user_id)
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    return db_answer

def get_answers_by_question(db: Session, question_id: int):
    return db.query(Answer).options(joinedload(Answer.owner)).filter(Answer.question_id == question_id).order_by(Answer.created_at.desc()).all()

def get_answers_by_owner(db: Session, user_id: int):
    return db.query(Answer).options(joinedload(Answer.question)).filter(Answer.owner_id == user_id).order_by(Answer.created_at.desc()).all()

# --- YENİ EKLENENLER ---
def get_answer_by_id(db: Session, answer_id: int):
    return db.query(Answer).filter(Answer.id == answer_id).first()

def update_answer(db: Session, db_answer: Answer, update_data):
    db_answer.content = update_data.content
    db.commit()
    db.refresh(db_answer)
    return db_answer

def delete_answer(db: Session, answer_id: int):
    db.query(Answer).filter(Answer.id == answer_id).delete()
    db.commit()