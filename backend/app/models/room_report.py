from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class RoomReport(Base):
    __tablename__ = "room_reports"

    id          = Column(Integer, primary_key=True, index=True)
    room_id     = Column(Integer, ForeignKey("study_rooms.id"), nullable=False)
    message_id  = Column(Integer, ForeignKey("room_messages.id"), nullable=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason      = Column(String(50), nullable=False)    # spam | offensive | off_topic | other
    description = Column(String(500), nullable=True)
    status      = Column(String(20), default="pending") # pending | resolved | dismissed
    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at  = Column(DateTime, default=datetime.now)

    room     = relationship("StudyRoom", back_populates="reports")
    reporter = relationship("User", foreign_keys=[reporter_id], backref="room_reports")
    resolver = relationship("User", foreign_keys=[resolved_by])
