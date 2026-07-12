from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.driver import DriverCreate, DriverUpdate, DriverResponse
from app.services import driver_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[DriverResponse])
def read_drivers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return driver_service.get_drivers(db, skip=skip, limit=limit)

@router.post("/", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver(driver_in: DriverCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return driver_service.create_driver(db, driver_in)

@router.get("/{driver_id}", response_model=DriverResponse)
def read_driver(driver_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    driver = driver_service.get_driver_by_id(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@router.put("/{driver_id}", response_model=DriverResponse)
def update_driver(driver_id: int, driver_in: DriverUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return driver_service.update_driver(db, driver_id, driver_in)

@router.delete("/{driver_id}", response_model=DriverResponse)
def delete_driver(driver_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return driver_service.delete_driver(db, driver_id)
