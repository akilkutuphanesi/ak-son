from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)
    
    # YENİ EKLENEN SÜTUN:
    department = Column(String(100), nullable=True)
    
    # AVATAR VE İSİM (PERSISTENCE İÇİN)
    display_name = Column(String(100), nullable=True)
    avatar_url = Column(String(255), nullable=True)

    # İlişkiler
    questions = relationship("Question", back_populates="owner")
    answers = relationship("Answer", back_populates="owner")

    notifications = relationship("Notification", back_populates="owner")