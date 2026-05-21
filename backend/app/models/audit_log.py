from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer)
    admin_name = Column(String(100))
    action = Column(String(100))
    details = Column(String(2000))
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
