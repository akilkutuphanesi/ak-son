from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    answer_id = Column(Integer, ForeignKey("answers.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    # İlişkiler
    user = relationship("User", back_populates="favorites")
    question = relationship("Question", back_populates="favorites")
    answer = relationship("Answer", back_populates="favorites")

    __table_args__ = (
        UniqueConstraint('user_id', 'question_id', name='uq_user_question_fav'),
        UniqueConstraint('user_id', 'answer_id', name='uq_user_answer_fav'),
    )
