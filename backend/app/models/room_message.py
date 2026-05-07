from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class RoomMessage(Base):
    __tablename__ = "room_messages"

    id        = Column(Integer, primary_key=True, index=True)
    room_id   = Column(Integer, ForeignKey("study_rooms.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Null → sistem mesajı
    content   = Column(String(500), nullable=False)
    is_system = Column(Boolean, default=False)   # "Ahmet odaya katıldı" vb.
    is_hidden = Column(Boolean, default=False)   # Admin moderasyonu
    sent_at   = Column(DateTime, default=datetime.now)

    room   = relationship("StudyRoom", back_populates="messages")
    sender = relationship("User", backref="room_messages")
