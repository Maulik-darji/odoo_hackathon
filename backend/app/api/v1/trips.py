from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.trip import TripCreate, TripUpdate, TripResponse
from app.services import trip_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[TripResponse])
def read_trips(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return trip_service.get_trips(db, skip=skip, limit=limit)

@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(trip_in: TripCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return trip_service.create_trip(db, trip_in)

@router.get("/{trip_id}", response_model=TripResponse)
def read_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = trip_service.get_trip_by_id(db, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: int, trip_in: TripUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return trip_service.update_trip(db, trip_id, trip_in)

@router.delete("/{trip_id}", response_model=TripResponse)
def delete_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return trip_service.delete_trip(db, trip_id)
