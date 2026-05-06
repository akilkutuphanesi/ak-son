from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from datetime import timedelta
from jose import JWTError, jwt
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import create_access_token, verify_password, get_password_hash, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.repositories import user_repo
from app.schemas.user import UserCreate, UserResponse, Token, UserProfileUpdate, UserPublicProfile
from app.models.user import User
from app.repositories import question_repo, answer_repo

# Silme işlemi için gereken modeller
from app.models.question import Question
from app.models.answer import Answer
from app.models.notification import Notification
from app.models.favorite import Favorite

router = APIRouter(prefix="/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

from app.core.rate_limit import limiter

# --- SCHEMAS (Veri Modelleri) ---
class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: str

# 1. KAYIT OLMA
@router.post("/register", response_model=UserResponse)
@limiter.limit("5/minute")
def register(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    db_user = user_repo.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı.")
    return user_repo.create_user(db=db, user=user)

# 2. GİRİŞ YAPMA
@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = user_repo.get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hatalı email veya şifre",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES) # Token süresi security.py'den alınır
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
@router.get("/me", response_model=UserPublicProfile)
def read_users_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_questions = question_repo.get_questions_by_owner(db, current_user.id)
    user_answers = answer_repo.get_answers_by_owner(db, current_user.id)
    
    calculated_reputation = (len(user_questions) * 2) + (len(user_answers) * 5) + sum(15 for a in user_answers if getattr(a, 'is_best_answer', False))
    
    badge = "Çaylak"
    if calculated_reputation >= 200: badge = "Ordinaryüs"
    elif calculated_reputation >= 100: badge = "Usta"
    elif calculated_reputation >= 50: badge = "Bilgin"
    elif calculated_reputation >= 20: badge = "Çırak"
    
    return UserPublicProfile(
        id=current_user.id,
        email=current_user.email,
        display_name=current_user.display_name,
        avatar_url=current_user.avatar_url,
        department=current_user.department,
        question_count=len(user_questions),
        answer_count=len(user_answers),
        reputation=calculated_reputation,
        badge=badge
    )

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
        
        # 3. Kullanıcının yaptığı diğer tüm yorumları, bildirimleri ve favorileri sil
        db.query(Answer).filter(Answer.owner_id == current_user.id).delete(synchronize_session=False)
        db.query(Notification).filter(Notification.user_id == current_user.id).delete(synchronize_session=False)
        db.query(Favorite).filter(Favorite.user_id == current_user.id).delete(synchronize_session=False)
        
        # 4. Son olarak kullanıcının kendisini sil
        db.delete(current_user)
        db.commit()
        
        return {"message": "Hesap ve bağlı tüm veriler başarıyla silindi."}
    except Exception as e:
        db.rollback()
        print(f"Hata oluştu: {str(e)}") # Terminalde hatayı görmek için
        raise HTTPException(status_code=500, detail="Hesap silinirken bir hata oluştu. Sunucu loglarına bakın.")

# 7. ŞİFREMİ UNUTTUM (Simülasyon)
@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = user_repo.get_user_by_email(db, email=body.email)
    if not user:
        # Güvenlik gereği email sistemde olmasa bile aynı mesajı döneriz (Email Enumeration'ı engellemek için) ama bu eğitim projesi, doğrudan mesaj verebiliriz.
        raise HTTPException(status_code=404, detail="Bu e-posta adresi ile kayıtlı bir hesap bulunamadı.")
    
    # Normalde burada kullanıcıya SMTP ile bir şifre sıfırlama linki/kodu gönderilir.
    # Biz frontend'e başarılı mesajı dönüyoruz.
    return {"message": "Şifre sıfırlama bağlantısı gönderildi"}