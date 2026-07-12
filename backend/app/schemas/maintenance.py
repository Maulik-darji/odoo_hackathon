from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.maintenance import MaintenanceStatusEnum

class MaintenanceBase(BaseModel):
    vehicle_id: int
    description: str
    cost: float
    start_date: datetime
    end_date: Optional[datetime] = None
    status: Optional[MaintenanceStatusEnum] = MaintenanceStatusEnum.SCHEDULED

class MaintenanceCreate(MaintenanceBase):
    pass

class MaintenanceUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    description: Optional[str] = None
    cost: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[MaintenanceStatusEnum] = None

class MaintenanceResponse(MaintenanceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
