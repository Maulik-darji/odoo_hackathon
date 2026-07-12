from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse
from app.services import vehicle_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[VehicleResponse])
def read_vehicles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return vehicle_service.get_vehicles(db, skip=skip, limit=limit)

@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(vehicle_in: VehicleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return vehicle_service.create_vehicle(db, vehicle_in)

@router.get("/{vehicle_id}", response_model=VehicleResponse)
def read_vehicle(vehicle_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vehicle = vehicle_service.get_vehicle_by_id(db, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(vehicle_id: int, vehicle_in: VehicleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return vehicle_service.update_vehicle(db, vehicle_id, vehicle_in)

@router.delete("/{vehicle_id}", response_model=VehicleResponse)
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return vehicle_service.delete_vehicle(db, vehicle_id)
