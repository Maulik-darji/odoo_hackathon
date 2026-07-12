from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.trip import TripStatusEnum

class TripBase(BaseModel):
    vehicle_id: int
    driver_id: int
    source: str
    destination: str
    cargo_weight: float
    planned_distance: Optional[float] = 0.0
    start_time: datetime
    end_time: Optional[datetime] = None
    status: Optional[TripStatusEnum] = TripStatusEnum.DRAFT
    route_details: Optional[str] = None

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    source: Optional[str] = None
    destination: Optional[str] = None
    cargo_weight: Optional[float] = None
    planned_distance: Optional[float] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[TripStatusEnum] = None
    route_details: Optional[str] = None

class TripResponse(TripBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
