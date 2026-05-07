from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class RoomSession(Base):
    __tablename__ = "room_sessions"

    id             = Column(Integer, primary_key=True, index=True)
    room_id        = Column(Integer, ForeignKey("study_rooms.id"), nullable=False)
    session_number = Column(Integer, default=1)
    type           = Column(String(20), default="work")   # work | short_break | long_break
    started_at     = Column(DateTime, default=datetime.now)
    ended_at       = Column(DateTime, nullable=True)
    duration_secs  = Column(Integer, default=1500)        # 25 dk

    room = relationship("StudyRoom", back_populates="sessions")
