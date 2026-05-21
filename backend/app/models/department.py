from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True)
    students = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
