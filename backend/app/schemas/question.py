from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.user import UserResponse

class QuestionBase(BaseModel):
    title: str
    content: str

class QuestionCreate(QuestionBase):
    pass

class QuestionResponse(QuestionBase):
    id: int
    owner_id: int
    created_at: datetime
    # --- YENİ EKLENEN KISIM ---
    image_url: Optional[str] = None
    # --------------------------
    owner: Optional[UserResponse] = None

    class Config:
        from_attributes = True