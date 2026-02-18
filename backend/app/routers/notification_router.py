from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
# Yeni oluşturduğumuz Schema'yı import ediyoruz
from app.schemas.notification import NotificationResponse 
from app.repositories import notification_repo
from app.models.user import User
from app.routers.auth_router import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationResponse])
def get_my_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return notification_repo.get_my_notifications(db, user_id=current_user.id)

@router.post("/mark-as-read", status_code=status.HTTP_200_OK)
def mark_notifications_as_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notification_repo.mark_all_as_read(db, user_id=current_user.id)
    return {"message": "Tüm bildirimler okundu işaretlendi"}