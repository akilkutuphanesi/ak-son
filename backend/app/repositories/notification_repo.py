from sqlalchemy.orm import Session
from app.models.notification import Notification

def create_notification(db: Session, user_id: int, content: str, question_id: int = None):
    db_notif = Notification(
        user_id=user_id,
        content=content,
        question_id=question_id,
        is_read=False
    )
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif

def get_my_notifications(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.user_id == user_id).all()

# --- EKSİK OLAN FONKSİYON BU ---
def mark_all_as_read(db: Session, user_id: int):
    # Kullanıcının tüm bildirimlerini 'okundu' (True) yap
    db.query(Notification).filter(Notification.user_id == user_id).update({"is_read": True})
    db.commit()