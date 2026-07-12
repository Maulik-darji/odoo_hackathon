from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.trip import TripCreate, TripResponse, TripUpdate
from app.services.trip_service import (
    create_trip,
    delete_trip,
    get_trip_by_id,
    get_trips,
    update_trip,
)

router = APIRouter()


@router.get("/", response_model=list[TripResponse])
def list_trips(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_trips(db, skip=skip, limit=limit)


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trip = get_trip_by_id(db, trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
    return trip


@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip_endpoint(
    trip_in: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_trip(db, trip_in)


@router.put("/{trip_id}", response_model=TripResponse)
def update_trip_endpoint(
    trip_id: int,
    trip_in: TripUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_trip(db, trip_id, trip_in)


@router.delete("/{trip_id}", response_model=TripResponse)
def delete_trip_endpoint(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_trip(db, trip_id)
