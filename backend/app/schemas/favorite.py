from pydantic import BaseModel, model_validator
from datetime import datetime
from typing import Optional

class FavoriteCreate(BaseModel):
    question_id: Optional[int] = None
    answer_id: Optional[int] = None

    @model_validator(mode='after')
    def check_one_target(self):
        if not self.question_id and not self.answer_id:
            raise ValueError("question_id veya answer_id'den biri zorunludur.")
        if self.question_id and self.answer_id:
            raise ValueError("Aynı anda hem question_id hem answer_id gönderilemez.")
        return self

class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    question_id: Optional[int] = None
    answer_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class FavoriteToggleResponse(BaseModel):
    is_favorited: bool
    favorite_count: int
