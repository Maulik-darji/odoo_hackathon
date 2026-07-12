from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.vehicle import VehicleStatusEnum, VehicleTypeEnum

class VehicleBase(BaseModel):
    registration_number: str
    make: str
    model: str
    vehicle_type: Optional[VehicleTypeEnum] = VehicleTypeEnum.TRUCK
    capacity: float
    odometer: Optional[float] = 0.0
    acquisition_cost: Optional[float] = 0.0
    status: Optional[VehicleStatusEnum] = VehicleStatusEnum.AVAILABLE
    region: Optional[str] = "National"

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    vehicle_type: Optional[VehicleTypeEnum] = None
    capacity: Optional[float] = None
    odometer: Optional[float] = None
    acquisition_cost: Optional[float] = None
    status: Optional[VehicleStatusEnum] = None
    region: Optional[str] = None

class VehicleResponse(VehicleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
