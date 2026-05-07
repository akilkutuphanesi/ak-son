from sqlalchemy.orm import Session, joinedload, selectinload
from app.models.question import Question
from app.models.answer import Answer
from app.models.notification import Notification # <-- Bildirim modelini de ekledik

def get_all_questions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Question)\
        .options(joinedload(Question.owner), selectinload(Question.answers), selectinload(Question.favorites))\
        .filter(Question.is_suspended == False)\
        .order_by(Question.created_at.desc()).offset(skip).limit(limit).all()

def get_questions_by_owner(db: Session, user_id: int):
    return db.query(Question)\
        .options(joinedload(Question.owner), selectinload(Question.answers), selectinload(Question.favorites))\
        .filter(Question.owner_id == user_id)\
        .order_by(Question.created_at.desc()).all()

# image_url parametresini ekledik
def create_question(db: Session, question, user_id: int, image_url: str = None):
    db_question = Question(
        title=question.title, 
        content=question.content, 
        owner_id=user_id,
        image_url=image_url
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def get_question_by_id(db: Session, question_id: int):
    return db.query(Question).options(joinedload(Question.owner)).filter(Question.id == question_id).first()

def update_question(db: Session, db_question: Question, update_data):
    if update_data.title is not None:
        db_question.title = update_data.title
    if update_data.content is not None:
        db_question.content = update_data.content
    if update_data.image_url is not None:
        db_question.image_url = update_data.image_url
    db.commit()
    db.refresh(db_question)
    return db_question

def delete_question(db: Session, question_id: int):
    # 1. Önce bu soruya bağlı BİLDİRİMLERİ siliyoruz
    db.query(Notification).filter(Notification.question_id == question_id).delete()
    
    # 2. Sonra bu soruya bağlı CEVAPLARI siliyoruz
    db.query(Answer).filter(Answer.question_id == question_id).delete()
    
    # 3. Artık hiçbir bağı kalmayan SORUYU güvenle siliyoruz
    db.query(Question).filter(Question.id == question_id).delete()
    
    # 4. Değişiklikleri kaydediyoruz
    db.commit()