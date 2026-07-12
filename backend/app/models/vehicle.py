from sqlalchemy import Column, Integer, String, Float, Enum, DateTime
from sqlalchemy.sql import func
import enum
from app.db.database import Base

class VehicleStatusEnum(str, enum.Enum):
    ACTIVE = "Active"
    IN_SHOP = "In Shop"
    RETIRED = "Retired"

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, index=True, nullable=False)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    capacity = Column(Float, nullable=False) # e.g. cargo capacity in kg/tons
    status = Column(Enum(VehicleStatusEnum), default=VehicleStatusEnum.ACTIVE, nullable=False)
    mileage = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
