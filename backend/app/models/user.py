from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    
    # YENİ EKLENEN SÜTUN:
    department = Column(String(100), nullable=True)
    
    # AVATAR VE İSİM (PERSISTENCE İÇİN)
    display_name = Column(String(100), nullable=True)
    avatar_url = Column(String(255), nullable=True)

    # İlişkiler
    questions = relationship("Question", back_populates="owner")
    answers = relationship("Answer", back_populates="owner")
    notifications = relationship("Notification", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")

    @property
    def reputation(self):
        q_score = len(self.questions) * 2 if self.questions else 0
        a_score = len(self.answers) * 5 if self.answers else 0
        best_score = sum(15 for a in self.answers if getattr(a, 'is_best_answer', False)) if self.answers else 0
        return q_score + a_score + best_score

    @property
    def badge(self):
        score = self.reputation
        if score < 10:
            return "Çaylak"
        elif score < 50:
            return "Araştırmacı"
        elif score < 150:
            return "Bilge"
        else:
            return "Uzman"