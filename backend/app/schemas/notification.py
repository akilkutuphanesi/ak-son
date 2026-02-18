from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotificationBase(BaseModel):
    content: str

class NotificationCreate(NotificationBase):
    user_id: int
    question_id: Optional[int] = None

# Frontend'e giden veri paketi bu.
# İçinde "question_id" olduğu için React bunu okuyup ilgili soruyu açabilecek.
class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    question_id: Optional[int] = None 

    class Config:
        from_attributes = True