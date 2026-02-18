from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from app.core.database import Base
from sqlalchemy.orm import relationship

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100))
    content = Column(String(1000))
    # image_url BURADAN KALDIRILDI
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.now)

    owner = relationship("User", back_populates="questions")
    answers = relationship("Answer", back_populates="question")