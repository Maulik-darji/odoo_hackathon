from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
import enum
from app.db.database import Base

class DriverStatusEnum(str, enum.Enum):
    ACTIVE = "Active"
    SUSPENDED = "Suspended"
    OFF_DUTY = "Off-Duty"

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, index=True, nullable=False)
    license_expiry = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(DriverStatusEnum), default=DriverStatusEnum.ACTIVE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
