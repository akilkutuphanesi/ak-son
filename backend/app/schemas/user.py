from pydantic import BaseModel, EmailStr
from typing import Optional

# Ortak Temel Sınıf
class UserBase(BaseModel):
    email: EmailStr
    department: Optional[str] = None
    is_active: Optional[bool] = True

# Kayıt Olurken İstenen (Şifre var)
class UserCreate(UserBase):
    password: str
    department: str # Kayıtta zorunlu
    display_name: Optional[str] = None

# Kullanıcı Bilgisi Dönerken (Şifre YOK, ID var)
class UserResponse(UserBase):
    id: int
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

# Profil Güncelleme İçin DTO
class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None

# Token Dönüş Tipi
class Token(BaseModel):
    access_token: str
    token_type: str

# Herkese Açık Kullanıcı Profili (soru/cevap sayısı dahil)
class UserPublicProfile(BaseModel):
    id: int
    email: EmailStr
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    department: Optional[str] = None
    question_count: int = 0
    answer_count: int = 0

    class Config:
        from_attributes = True