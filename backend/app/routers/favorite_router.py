from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.favorite import FavoriteCreate, FavoriteResponse, FavoriteToggleResponse
from app.repositories import favorite_repo, question_repo, answer_repo
from app.models.user import User
from app.routers.auth_router import get_current_user

router = APIRouter(prefix="/favorites", tags=["Favorites"])

# 1. FAVORİ TOGGLE (Ekle/Kaldır)
@router.post("/toggle", response_model=FavoriteToggleResponse)
def toggle_favorite(
    data: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Hedef var mı kontrol et
    if data.question_id:
        question = question_repo.get_question_by_id(db, data.question_id)
        if not question:
            raise HTTPException(status_code=404, detail="Soru bulunamadı")
    if data.answer_id:
        answer = answer_repo.get_answer_by_id(db, data.answer_id)
        if not answer:
            raise HTTPException(status_code=404, detail="Cevap bulunamadı")

    # Toggle mantığı
    already_fav = favorite_repo.is_favorited(
        db, user_id=current_user.id,
        question_id=data.question_id,
        answer_id=data.answer_id
    )

    if already_fav:
        favorite_repo.remove_favorite(
            db, user_id=current_user.id,
            question_id=data.question_id,
            answer_id=data.answer_id
        )
        is_favorited = False
    else:
        favorite_repo.add_favorite(
            db, user_id=current_user.id,
            question_id=data.question_id,
            answer_id=data.answer_id
        )
        is_favorited = True

    # Güncel sayıyı döndür
    count = favorite_repo.get_favorite_count(
        db,
        question_id=data.question_id,
        answer_id=data.answer_id
    )

    return FavoriteToggleResponse(is_favorited=is_favorited, favorite_count=count)

# 2. BENİM FAVORİLERİM
@router.get("/me", response_model=List[FavoriteResponse])
def get_my_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return favorite_repo.get_favorites_by_user(db, user_id=current_user.id)
