from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.routers.auth_router import get_current_user
from app.models.user import User
from app.repositories import notification_repo

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# Basit Şema
class NotificationOut(BaseModel):
    id: int
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[NotificationOut])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Giriş yapmış kullanıcının bildirimlerini getirir"""
    return notification_repo.get_my_notifications(db, user_id=current_user.id)

@router.post("/mark-as-read")
def mark_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kullanıcının tüm bildirimlerini okundu olarak işaretler"""
    notification_repo.mark_all_as_read(db, user_id=current_user.id)
    return {"message": "Tüm bildirimler okundu."}