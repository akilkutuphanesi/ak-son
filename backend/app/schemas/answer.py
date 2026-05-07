from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.schemas.user import UserResponse

# Soru bilgisini içeren şema
class QuestionInfo(BaseModel):
    id: int
    title: str
    content: str
    image_url: Optional[str] = None
    created_at: datetime
    owner_id: int
    owner: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

class AnswerBase(BaseModel):
    content: str = Field(..., min_length=2, max_length=3000)

class AnswerCreate(AnswerBase):
    question_id: int

class AnswerUpdate(BaseModel):
    content: str = Field(..., min_length=2, max_length=3000)

class AnswerResponse(AnswerBase):
    id: int
    content: str
    created_at: datetime
    is_best_answer: bool = False
    question_id: int
    owner_id: int
    owner: Optional[UserResponse] = None
    question: Optional[QuestionInfo] = None 

    class Config:
        from_attributes = True