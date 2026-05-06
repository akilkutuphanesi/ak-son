from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from app.core.database import get_db
from app.routers.auth_router import get_current_user
from app.models.user import User
from app.models.question import Question
from app.models.answer import Answer
from app.schemas.user import UserResponse

router = APIRouter(prefix="/admin", tags=["Admin"])

# Admin yetkisi kontrolü için yardımcı fonksiyon
def check_admin(current_user: User):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işleme yetkiniz yok. Sadece yöneticiler erişebilir."
        )

# 1. DİNAMİK İSTATİSTİKLER (Dashboard İçin)
@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    # İstatistikleri veritabanından çek
    total_users = db.query(User).count()
    total_questions = db.query(Question).count()
    
    # Çözülen Sorular (En az 1 cevabı olan benzersiz soru sayısı)
    solved_questions = db.query(Answer.question_id).distinct().count()
    
    # Basit bir simülasyon (Gerçek dünyada aktif kullanıcıyı Redis ile vb. tutarız)
    active_users = db.query(User).filter(User.is_active == True).count()
    
    return {
        "stats": [
            { "title": "Toplam Kullanıcı", "value": str(total_users), "increase": "+1", "color": "text-blue-400" },
            { "title": "Aktif Hesap", "value": str(active_users), "increase": "Tümü", "color": "text-emerald-400" },
            { "title": "Toplam İçerik", "value": str(total_questions), "increase": "+1", "color": "text-amber-400" },
            { "title": "Çözülen Sorular", "value": str(solved_questions), "increase": "+1", "color": "text-purple-400" }
        ]
    }

# 2. TÜM KULLANICILAR (UsersTab İçin)
@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    users = db.query(User).all()
    return users

# 3. İÇERİKLER (ContentTab İçin - Sorular)
@router.get("/contents")
def get_all_contents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    questions = db.query(Question).all()
    
    result = []
    for q in questions:
        author_name = q.owner.display_name if q.owner and q.owner.display_name else (q.owner.email.split('@')[0] if q.owner else "İsimsiz")
        
        result.append({
            "id": q.id,
            "author": author_name,
            "title": q.title,
            "content": q.content,
            "reports": 0, # Şimdilik sahte
            "status": "Askıya Alındı" if q.is_suspended else "Yayında",
            "category": "Genel", # Question modelinde şimdilik kategori yok
            "date": q.created_at.strftime("%d.%m.%Y %H:%M") if q.created_at else "Bilinmiyor"
        })
        
    # Tarihe göre en yeniler üstte olsun diye ters çeviriyoruz
    result.reverse()
    return result

# 4. İÇERİK SİLME
from app.models.notification import Notification
from app.models.favorite import Favorite

@router.delete("/contents/{content_id}")
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    question = db.query(Question).filter(Question.id == content_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="İçerik bulunamadı")
        
    # Soruya ait tüm verileri sil
    db.query(Notification).filter(Notification.question_id == question.id).delete(synchronize_session=False)
    db.query(Answer).filter(Answer.question_id == question.id).delete(synchronize_session=False)
    db.query(Favorite).filter(Favorite.question_id == question.id).delete(synchronize_session=False)
    
    db.delete(question)
    db.commit()
    
    return {"message": "İçerik başarıyla silindi"}

# 5. İÇERİK ASKIYA ALMA / YAYINA ALMA
@router.patch("/contents/{content_id}/toggle-status")
def toggle_content_status(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    question = db.query(Question).filter(Question.id == content_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="İçerik bulunamadı")
        
    question.is_suspended = not question.is_suspended
    db.commit()
    
    return {"message": "İçerik durumu güncellendi", "new_status": "Askıya Alındı" if question.is_suspended else "Yayında"}
