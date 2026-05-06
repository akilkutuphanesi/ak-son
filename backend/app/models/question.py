from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from datetime import datetime
from app.core.database import Base
from sqlalchemy.orm import relationship

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100))
    content = Column(String(1000))
    # --- YENİ EKLENEN KISIM (Resim Linki) ---
    image_url = Column(String(500), nullable=True)
    # ----------------------------------------
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.now)
    is_suspended = Column(Boolean, default=False)

    owner = relationship("User", back_populates="questions")
    answers = relationship("Answer", back_populates="question")
    favorites = relationship("Favorite", back_populates="question")

    @property
    def answer_count(self):
        return len(self.answers) if self.answers else 0

    @property
    def favorite_count(self):
        return len(self.favorites) if self.favorites else 0