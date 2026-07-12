from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.expense import ExpenseTypeEnum

class ExpenseBase(BaseModel):
    type: ExpenseTypeEnum
    amount: float
    date: datetime
    vehicle_id: Optional[int] = None
    trip_id: Optional[int] = None
    description: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    type: Optional[ExpenseTypeEnum] = None
    amount: Optional[float] = None
    date: Optional[datetime] = None
    vehicle_id: Optional[int] = None
    trip_id: Optional[int] = None
    description: Optional[str] = None

class ExpenseResponse(ExpenseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
