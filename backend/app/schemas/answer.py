from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.user import UserResponse

# Soru bilgisini içeren şema
class QuestionInfo(BaseModel):
    id: int
    title: str
    content: str
    image_url: Optional[str] = None # <-- BURADA DA OLMALI
    created_at: datetime
    owner_id: int
    
    class Config:
        from_attributes = True

class AnswerBase(BaseModel):
    content: str

class AnswerCreate(AnswerBase):
    question_id: int

class AnswerUpdate(BaseModel):
    content: str

class AnswerResponse(AnswerBase):
    id: int
    content: str
    created_at: datetime
    question_id: int
    owner_id: int
    owner: Optional[UserResponse] = None
    question: Optional[QuestionInfo] = None 

    class Config:
        from_attributes = True