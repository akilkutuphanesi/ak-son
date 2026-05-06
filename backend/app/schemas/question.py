from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.user import UserResponse

class QuestionBase(BaseModel):
    title: str
    content: str

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None

class QuestionResponse(QuestionBase):
    id: int
    owner_id: int
    created_at: datetime
    # --- YENİ EKLENEN KISIM ---
    image_url: Optional[str] = None
    answer_count: Optional[int] = 0
    favorite_count: Optional[int] = 0
    is_favorited: Optional[bool] = False
    # --------------------------
    owner: Optional[UserResponse] = None

    class Config:
        from_attributes = True