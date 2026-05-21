from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from app.core.database import Base

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    content = Column(String(2000))
    date = Column(DateTime, default=datetime.now)
    priority = Column(String(50), default="normal")
    target = Column(String(100), default="all")
    is_active = Column(Boolean, default=True)
