from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean
from sqlalchemy.sql import func
import enum
from app.db.database import Base

class RoleEnum(str, enum.Enum):
    ADMIN = "Admin"
    FLEET_MANAGER = "Fleet Manager"
    DISPATCHER = "Dispatcher"
    SAFETY_OFFICER = "Safety Officer"
    FINANCIAL_ANALYST = "Financial Analyst"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True) # Full Name
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    tour_completed = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=False, nullable=True)
    is_admin = Column(Boolean, default=False, nullable=True)
    requested_role = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
