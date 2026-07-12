from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base

class ExpenseTypeEnum(str, enum.Enum):
    FUEL = "Fuel"
    TOLL = "Toll"
    MAINTENANCE = "Maintenance"
    OTHER = "Other"

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(ExpenseTypeEnum), nullable=False)
    amount = Column(Float, nullable=False)
    liters = Column(Float, nullable=True) # fuel quantity in liters (for Fuel type)
    date = Column(DateTime(timezone=True), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vehicle = relationship("Vehicle")
    trip = relationship("Trip")
