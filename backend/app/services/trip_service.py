from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.trip import Trip, TripStatusEnum
from app.schemas.trip import TripCreate, TripUpdate
from app.services.vehicle_service import get_vehicle_by_id
from app.services.driver_service import get_driver_by_id
from app.models.vehicle import VehicleStatusEnum
from app.models.driver import DriverStatusEnum

def get_trips(db: Session, skip: int = 0, limit: int = 100) -> list[Trip]:
    return db.query(Trip).offset(skip).limit(limit).all()

def get_trip_by_id(db: Session, trip_id: int) -> Trip | None:
    return db.query(Trip).filter(Trip.id == trip_id).first()

def create_trip(db: Session, trip_in: TripCreate) -> Trip:
    vehicle = get_vehicle_by_id(db, trip_in.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=400, detail="Vehicle not found.")
    
    if vehicle.status != VehicleStatusEnum.ACTIVE:
        raise HTTPException(status_code=400, detail="Vehicle is not active.")
        
    if trip_in.cargo_weight > vehicle.capacity:
        raise HTTPException(status_code=400, detail="Cargo weight exceeds vehicle capacity.")

    driver = get_driver_by_id(db, trip_in.driver_id)
    if not driver:
        raise HTTPException(status_code=400, detail="Driver not found.")
        
    if driver.status != DriverStatusEnum.ACTIVE:
        raise HTTPException(status_code=400, detail="Driver is not active.")
        
    db_trip = Trip(**trip_in.model_dump())
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

def update_trip(db: Session, trip_id: int, trip_in: TripUpdate) -> Trip:
    db_trip = get_trip_by_id(db, trip_id)
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found.")
    
    update_data = trip_in.model_dump(exclude_unset=True)
    
    if "vehicle_id" in update_data and update_data["vehicle_id"] != db_trip.vehicle_id:
        vehicle = get_vehicle_by_id(db, update_data["vehicle_id"])
        if not vehicle or vehicle.status != VehicleStatusEnum.ACTIVE:
            raise HTTPException(status_code=400, detail="Invalid or inactive vehicle.")
        if "cargo_weight" in update_data:
            cw = update_data["cargo_weight"]
        else:
            cw = db_trip.cargo_weight
        if cw > vehicle.capacity:
            raise HTTPException(status_code=400, detail="Cargo weight exceeds vehicle capacity.")
            
    for key, value in update_data.items():
        setattr(db_trip, key, value)
        
    db.commit()
    db.refresh(db_trip)
    return db_trip

def delete_trip(db: Session, trip_id: int) -> Trip:
    db_trip = get_trip_by_id(db, trip_id)
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found.")
    db.delete(db_trip)
    db.commit()
    return db_trip
