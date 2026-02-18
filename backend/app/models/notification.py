from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime
from datetime import datetime
from app.core.database import Base
from sqlalchemy.orm import relationship

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String(500))
    # --- YENİ EKLENEN KISIM ---
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=True) 
    # --------------------------
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)

    owner = relationship("User", back_populates="notifications")