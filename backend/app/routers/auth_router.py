from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from datetime import timedelta
from jose import JWTError, jwt

from app.core.database import get_db
from app.core.security import create_access_token, verify_password, SECRET_KEY, ALGORITHM
from app.repositories import user_repo
from app.schemas.user import UserCreate, UserResponse, Token
from app.models.user import User
from pydantic import BaseModel
from pydantic import BaseModel
from fastapi import HTTPException, Depends, status
from app.core.security import verify_password, get_password_hash
from passlib.context import CryptContext
class ChangePasswordSchema(BaseModel):
    old_password: str
    new_password: str

router = APIRouter(prefix="/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

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
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# 3. CURRENT USER FONKSİYONU
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

# --- BU KISIM EKSİKTİ, EKLENDİ ---
# 4. BEN KİMİM? (Profil Bilgisi İçin)
@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Örnek FastAPI Endpoint mantığı
@router.post("/change-password")
async def change_password(
    passwords: ChangePasswordSchema, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Eski şifre doğru mu kontrol et
    if not verify_password(passwords.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mevcut şifre hatalı!")
    
    # 2. Yeni şifreyi hashle ve kaydet
    current_user.hashed_password = get_password_hash(passwords.new_password)
    db.commit()
    return {"message": "Şifre başarıyla güncellendi"}

# 1. Şifre verilerini karşılayacak yapı (Schema)
class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

# 2. Şifre değiştirme fonksiyonu
@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest, 
    current_user: User = Depends(get_current_user), # Giriş yapmış kullanıcıyı alır
    db: Session = Depends(get_db)
):
    # Eski şifre doğru mu?
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mevcut şifreniz hatalı!"
        )
    
    # Yeni şifreyi hashle ve kaydet
    current_user.hashed_password = get_password_hash(data.new_password)
    db.add(current_user)
    db.commit()
    
    return {"message": "Şifre başarıyla güncellendi"}

# Şifreleme ayarları
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)