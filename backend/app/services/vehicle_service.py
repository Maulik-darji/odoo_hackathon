from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.vehicle import Vehicle, VehicleStatusEnum
from app.schemas.vehicle import VehicleCreate, VehicleUpdate

def get_vehicles(db: Session, skip: int = 0, limit: int = 100) -> list[Vehicle]:
    return db.query(Vehicle).offset(skip).limit(limit).all()

def get_vehicle_by_id(db: Session, vehicle_id: int) -> Vehicle | None:
    return db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

def get_vehicle_by_reg_num(db: Session, reg_num: str) -> Vehicle | None:
    return db.query(Vehicle).filter(Vehicle.registration_number == reg_num).first()

def create_vehicle(db: Session, vehicle_in: VehicleCreate) -> Vehicle:
    # Rule: Vehicle Registration Number must be unique
    existing = get_vehicle_by_reg_num(db, vehicle_in.registration_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vehicle with registration number '{vehicle_in.registration_number}' already exists."
        )
    db_vehicle = Vehicle(**vehicle_in.model_dump())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

def update_vehicle(db: Session, vehicle_id: int, vehicle_in: VehicleUpdate) -> Vehicle:
    db_vehicle = get_vehicle_by_id(db, vehicle_id)
    if not db_vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found."
        )
    
    update_data = vehicle_in.model_dump(exclude_unset=True)
    
    # Rule: If updating registration number, check for uniqueness
    if "registration_number" in update_data and update_data["registration_number"] != db_vehicle.registration_number:
        existing = get_vehicle_by_reg_num(db, update_data["registration_number"])
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Vehicle with registration number '{update_data['registration_number']}' already exists."
            )
            
    for key, value in update_data.items():
        setattr(db_vehicle, key, value)
        
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

def delete_vehicle(db: Session, vehicle_id: int) -> Vehicle:
    db_vehicle = get_vehicle_by_id(db, vehicle_id)
    if not db_vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found."
        )
    db.delete(db_vehicle)
    db.commit()
    return db_vehicle
