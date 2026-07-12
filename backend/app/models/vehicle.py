from sqlalchemy import Column, Integer, String, Float, Enum, DateTime
from sqlalchemy.sql import func
import enum
from app.db.database import Base

class VehicleTypeEnum(str, enum.Enum):
    TRUCK = "Truck"
    VAN = "Van"
    BUS = "Bus"
    CAR = "Car"
    TRAILER = "Trailer"

class VehicleStatusEnum(str, enum.Enum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    IN_SHOP = "In Shop"
    RETIRED = "Retired"

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, index=True, nullable=False)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    vehicle_type = Column(String, default=VehicleTypeEnum.TRUCK.value, nullable=False)
    capacity = Column(Float, nullable=False) # Max load capacity in kg
    odometer = Column(Float, default=0.0)
    acquisition_cost = Column(Float, default=0.0)
    status = Column(String, default=VehicleStatusEnum.AVAILABLE.value, nullable=False)
    region = Column(String, default="National", nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
