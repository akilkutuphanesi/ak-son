from sqlalchemy.orm import Session
from app.models.notification import Notification

# question_id parametresini ekledik
def create_notification(db: Session, user_id: int, content: str, question_id: int = None):
    db_notif = Notification(
        user_id=user_id,
        content=content,
        question_id=question_id, # <-- Veritabanına yazılıyor
        is_read=False
    )
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif

def get_my_notifications(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

def mark_all_as_read(db: Session, user_id: int):
    db.query(Notification).filter(Notification.user_id == user_id).update({"is_read": True})
    db.commit()

# --- YENİ EKLENEN SİLME FONKSİYONU ---
def delete_all_user_notifications(db: Session, user_id: int):
    # Kullanıcıya ait tüm bildirimleri bul ve tamamen sil
    db.query(Notification).filter(Notification.user_id == user_id).delete()
    db.commit()