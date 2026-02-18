from sqlalchemy.orm import Session
from app.repositories import question_repo
from app.schemas.question import QuestionCreate

def list_questions(db: Session):
    return question_repo.get_questions(db)

def add_question(db: Session, question_data: QuestionCreate):
    # Burada gerekirse kontroller yapabilirsiniz
    return question_repo.create_question(db, question_data)