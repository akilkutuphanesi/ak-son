from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class RoomParticipant(Base):
    __tablename__ = "room_participants"

    id        = Column(Integer, primary_key=True, index=True)
    room_id   = Column(Integer, ForeignKey("study_rooms.id"), nullable=False)
    user_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.now)
    left_at   = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

    room = relationship("StudyRoom", back_populates="participants")
    user = relationship("User", backref="room_participations")
