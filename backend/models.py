from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String(32), unique=True, nullable=False, index=True)
    capacity = Column(Integer, nullable=False)
    status = Column(String(32), nullable=False, default="available")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    trips = relationship("Trip", back_populates="vehicle")


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    license_number = Column(String(64), unique=True, nullable=False, index=True)
    status = Column(String(32), nullable=False, default="available")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    trips = relationship("Trip", back_populates="driver")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    route_name = Column(String(100), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    status = Column(String(32), nullable=False, default="scheduled")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")

