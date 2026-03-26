from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from datetime import timedelta
from jose import JWTError, jwt
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import create_access_token, verify_password, get_password_hash, SECRET_KEY, ALGORITHM
from app.repositories import user_repo
from app.schemas.user import UserCreate, UserResponse, Token, UserProfileUpdate
from app.models.user import User

# Silme işlemi için gereken modeller
from app.models.question import Question
from app.models.answer import Answer
from app.models.notification import Notification

router = APIRouter(prefix="/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# --- SCHEMAS (Veri Modelleri) ---
class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

# 1. KAYIT OLMA
@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = user_repo.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı.")
    return user_repo.create_user(db=db, user=user)

# 2. GİRİŞ YAPMA
@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = user_repo.get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hatalı email veya şifre",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=1440) # 24 Saatlik token
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# 3. CURRENT USER FONKSİYONU (Kimin giriş yaptığını bulur)
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulanamadı",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = user_repo.get_user_by_email(db, email=username)
    if user is None:
        raise credentials_exception
        
    return user

# 4. BEN KİMİM? (Profil Bilgisi İçin)
@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# 4.1. PROFİL BİLGİLERİNİ GÜNCELLEME (Avatar, İsim)
@router.patch("/me/profile", response_model=UserResponse)
def update_user_profile(
    profile_data: UserProfileUpdate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.display_name is not None:
        current_user.display_name = profile_data.display_name
    if profile_data.avatar_url is not None:
        current_user.avatar_url = profile_data.avatar_url
        
    db.commit()
    db.refresh(current_user)
    return current_user

# 5. ŞİFRE DEĞİŞTİRME
@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Eski şifre doğru mu kontrol et
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mevcut şifreniz hatalı!"
        )
    
    # Yeni şifreyi hashle ve kaydet
    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    
    return {"message": "Şifre başarıyla güncellendi"}

# 6. HESABI KALICI OLARAK SİL
@router.delete("/delete-account")
def delete_my_account(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        # 1. Kullanıcının sahip olduğu soruları bul
        user_questions = db.query(Question).filter(Question.owner_id == current_user.id).all()
        
        # 2. Bu sorulara ait olan tüm bildirimleri ve cevapları sil
        for q in user_questions:
            db.query(Notification).filter(Notification.question_id == q.id).delete(synchronize_session=False)
            db.query(Answer).filter(Answer.question_id == q.id).delete(synchronize_session=False)
            db.delete(q) # Sorunun kendisini sil
        
        # 3. Kullanıcının yaptığı diğer tüm yorumları ve bildirimleri sil
        db.query(Answer).filter(Answer.owner_id == current_user.id).delete(synchronize_session=False)
        db.query(Notification).filter(Notification.user_id == current_user.id).delete(synchronize_session=False)
        
        # 4. Son olarak kullanıcının kendisini sil
        db.delete(current_user)
        db.commit()
        
        return {"message": "Hesap ve bağlı tüm veriler başarıyla silindi."}
    except Exception as e:
        db.rollback()
        print(f"Hata oluştu: {str(e)}") # Terminalde hatayı görmek için
        raise HTTPException(status_code=500, detail="Hesap silinirken bir hata oluştu. Sunucu loglarına bakın.")