from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.user import UserPublicProfile
from app.schemas.question import QuestionResponse
from app.schemas.answer import AnswerResponse
from app.repositories import user_repo, question_repo, answer_repo
from app.models.user import User
from app.routers.auth_router import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

# Liderlik Tablosu
@router.get("/leaderboard", response_model=List[UserPublicProfile])
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = user_repo.get_all_users_with_relations(db)
    
    leaderboard = []
    for user in users:
        calculated_reputation = (len(user.questions) * 2) + (len(user.answers) * 5) + sum(15 for a in user.answers if getattr(a, 'is_best_answer', False))
        
        if calculated_reputation > 0:
            badge = "Çaylak"
            if calculated_reputation >= 200: badge = "Ordinaryüs"
            elif calculated_reputation >= 100: badge = "Usta"
            elif calculated_reputation >= 50: badge = "Bilgin"
            elif calculated_reputation >= 20: badge = "Çırak"
            
            leaderboard.append(UserPublicProfile(
                id=user.id,
                email=user.email,
                display_name=user.display_name,
                avatar_url=user.avatar_url,
                department=user.department,
                question_count=len(user.questions),
                answer_count=len(user.answers),
                reputation=calculated_reputation,
                badge=badge
            ))
            
    # Reputation puana göre büyükten küçüğe sırala
    leaderboard.sort(key=lambda x: x.reputation, reverse=True)
    
    # En iyi 20 kişiyi döndür
    return leaderboard[:20]

# 1. KULLANICI PROFİLİ
@router.get("/{user_id}", response_model=UserPublicProfile)
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = user_repo.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Soru ve cevap sayılarını hesapla
    user_questions = question_repo.get_questions_by_owner(db, user_id)
    user_answers = answer_repo.get_answers_by_owner(db, user_id)
    
    calculated_reputation = (len(user_questions) * 2) + (len(user_answers) * 5) + sum(15 for a in user_answers if getattr(a, 'is_best_answer', False))
    
    badge = "Çaylak"
    if calculated_reputation >= 200: badge = "Ordinaryüs"
    elif calculated_reputation >= 100: badge = "Usta"
    elif calculated_reputation >= 50: badge = "Bilgin"
    elif calculated_reputation >= 20: badge = "Çırak"
    
    return UserPublicProfile(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        department=user.department,
        question_count=len(user_questions),
        answer_count=len(user_answers),
        reputation=calculated_reputation,
        badge=badge
    )

# 2. KULLANICININ SORULARI
@router.get("/{user_id}/questions", response_model=List[QuestionResponse])
def get_user_questions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = user_repo.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    questions = question_repo.get_questions_by_owner(db, user_id)
    
    result = []
    for q in questions:
        result.append(QuestionResponse(
            id=q.id,
            title=q.title,
            content=q.content,
            image_url=q.image_url,
            owner_id=q.owner_id,
            created_at=q.created_at,
            owner=q.owner,
            answer_count=len(q.answers) if q.answers else 0,
            favorite_count=len(q.favorites) if q.favorites else 0,
            is_favorited=any(f.user_id == current_user.id for f in q.favorites) if q.favorites else False
        ))
    return result

# 3. KULLANICININ CEVAPLARI
@router.get("/{user_id}/answers", response_model=List[AnswerResponse])
def get_user_answers(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = user_repo.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    return answer_repo.get_answers_by_owner(db, user_id)
