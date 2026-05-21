from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class RoomJoinRequest(Base):
    __tablename__ = "room_join_requests"

    id         = Column(Integer, primary_key=True, index=True)
    room_id    = Column(Integer, ForeignKey("study_rooms.id"), nullable=False)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    status     = Column(String(20), default="pending")  # pending | approved | rejected
    created_at = Column(DateTime, default=datetime.now)

    # Relationships
    room = relationship("StudyRoom", backref="join_requests")
    user = relationship("User", backref="room_join_requests")
