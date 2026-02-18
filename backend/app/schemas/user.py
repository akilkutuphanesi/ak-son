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

# Kullanıcı Bilgisi Dönerken (Şifre YOK, ID var)
class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

# Token Dönüş Tipi
class Token(BaseModel):
    access_token: str
    token_type: str