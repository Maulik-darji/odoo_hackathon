from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.driver import Driver, DriverStatusEnum
from app.schemas.driver import DriverCreate, DriverUpdate
from datetime import datetime

def get_drivers(db: Session, skip: int = 0, limit: int = 100) -> list[Driver]:
    return db.query(Driver).offset(skip).limit(limit).all()

def get_driver_by_id(db: Session, driver_id: int) -> Driver | None:
    return db.query(Driver).filter(Driver.id == driver_id).first()

def get_driver_by_license(db: Session, license_num: str) -> Driver | None:
    return db.query(Driver).filter(Driver.license_number == license_num).first()

def create_driver(db: Session, driver_in: DriverCreate) -> Driver:
    # Rule: Driver License must be unique
    existing = get_driver_by_license(db, driver_in.license_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Driver with license number '{driver_in.license_number}' already exists."
        )
    
    # Rule: License expiry validation
    if driver_in.license_expiry.replace(tzinfo=None) < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot register a driver with an expired license."
        )

    db_driver = Driver(**driver_in.model_dump())
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver

def update_driver(db: Session, driver_id: int, driver_in: DriverUpdate) -> Driver:
    db_driver = get_driver_by_id(db, driver_id)
    if not db_driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found."
        )
    
    update_data = driver_in.model_dump(exclude_unset=True)
    
    # Check for uniqueness if license changed
    if "license_number" in update_data and update_data["license_number"] != db_driver.license_number:
        existing = get_driver_by_license(db, update_data["license_number"])
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Driver with license number '{update_data['license_number']}' already exists."
            )
            
    if "license_expiry" in update_data:
        if update_data["license_expiry"].replace(tzinfo=None) < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update license expiry to a past date."
            )
            
    for key, value in update_data.items():
        setattr(db_driver, key, value)
        
    db.commit()
    db.refresh(db_driver)
    return db_driver

def delete_driver(db: Session, driver_id: int) -> Driver:
    db_driver = get_driver_by_id(db, driver_id)
    if not db_driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found."
        )
    db.delete(db_driver)
    db.commit()
    return db_driver
