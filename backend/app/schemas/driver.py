from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.driver import DriverStatusEnum

class DriverBase(BaseModel):
    name: str
    license_number: str
    license_expiry: datetime
    status: Optional[DriverStatusEnum] = DriverStatusEnum.ACTIVE

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    license_number: Optional[str] = None
    license_expiry: Optional[datetime] = None
    status: Optional[DriverStatusEnum] = None

class DriverResponse(DriverBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
