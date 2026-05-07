from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String(5000)) # Uzun cevaplar için
    created_at = Column(DateTime, default=datetime.now)
    is_best_answer = Column(Boolean, default=False)
    
    question_id = Column(Integer, ForeignKey("questions.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))

    # İlişkiler
    owner = relationship("User", back_populates="answers")
    
    # --- İŞTE EKSİK OLAN KISIM BURASIYDI ---
    # Cevabın hangi soruya ait olduğunu bilmesi için bu ilişki şart!
    question = relationship("Question", back_populates="answers")
    
    # Favori ilişkisi
    favorites = relationship("Favorite", back_populates="answer")