from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.vehicle import VehicleStatusEnum

class VehicleBase(BaseModel):
    registration_number: str
    make: str
    model: str
    capacity: float
    status: Optional[VehicleStatusEnum] = VehicleStatusEnum.ACTIVE
    mileage: Optional[float] = 0.0

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    capacity: Optional[float] = None
    status: Optional[VehicleStatusEnum] = None
    mileage: Optional[float] = None

class VehicleResponse(VehicleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
