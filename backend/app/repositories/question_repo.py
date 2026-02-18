from sqlalchemy.orm import Session, joinedload
from app.models.question import Question

def get_all_questions(db: Session):
    return db.query(Question).options(joinedload(Question.owner)).order_by(Question.created_at.desc()).all()

# image_url parametresini ekledik
def create_question(db: Session, question, user_id: int, image_url: str = None):
    db_question = Question(
        title=question.title, 
        content=question.content, 
        owner_id=user_id,
        image_url=image_url # <-- Kaydediyoruz
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def get_question_by_id(db: Session, question_id: int):
    return db.query(Question).options(joinedload(Question.owner)).filter(Question.id == question_id).first()

def delete_question(db: Session, question_id: int):
    db.query(Question).filter(Question.id == question_id).delete()
    db.commit()