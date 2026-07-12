from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.sql import func
import enum
from app.db.database import Base

class DriverStatusEnum(str, enum.Enum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    OFF_DUTY = "Off Duty"
    SUSPENDED = "Suspended"

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, index=True, nullable=False)
    license_category = Column(String, nullable=True) # e.g. "A", "B", "C", "D"
    license_expiry = Column(DateTime(timezone=True), nullable=False)
    contact_number = Column(String, nullable=True)
    safety_score = Column(Float, default=100.0) # 0-100 scale
    status = Column(Enum(DriverStatusEnum), default=DriverStatusEnum.AVAILABLE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
