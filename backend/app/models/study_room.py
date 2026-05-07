from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class StudyRoom(Base):
    __tablename__ = "study_rooms"

    id               = Column(Integer, primary_key=True, index=True)
    name             = Column(String(80), nullable=False)
    topic            = Column(String(120), nullable=False)
    department       = Column(String(100), nullable=True)   # Bölüm filtresi
    description      = Column(String(500), nullable=True)
    host_id          = Column(Integer, ForeignKey("users.id"), nullable=False)
    max_participants  = Column(Integer, default=10)
    is_public        = Column(Boolean, default=True)
    status           = Column(String(20), default="active")  # active | break | full | closed
    created_at       = Column(DateTime, default=datetime.now)
    closed_at        = Column(DateTime, nullable=True)
    closed_by        = Column(Integer, ForeignKey("users.id"), nullable=True)

    # İlişkiler
    host             = relationship("User", foreign_keys=[host_id], backref="hosted_rooms")
    closer           = relationship("User", foreign_keys=[closed_by])
    participants     = relationship("RoomParticipant", back_populates="room", cascade="all, delete-orphan")
    messages         = relationship("RoomMessage",     back_populates="room", cascade="all, delete-orphan")
    sessions         = relationship("RoomSession",     back_populates="room", cascade="all, delete-orphan")
    reports          = relationship("RoomReport",      back_populates="room", cascade="all, delete-orphan")

    @property
    def active_participant_count(self):
        return sum(1 for p in self.participants if p.is_active)
