from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.driver import DriverCreate, DriverResponse, DriverUpdate
from app.services.driver_service import (
    create_driver,
    delete_driver,
    get_driver_by_id,
    get_drivers,
    update_driver,
)

router = APIRouter()


@router.get("/", response_model=list[DriverResponse])
def list_drivers(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_drivers(db, skip=skip, limit=limit)


@router.get("/{driver_id}", response_model=DriverResponse)
def get_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    driver = get_driver_by_id(db, driver_id)
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found.")
    return driver


@router.post("/", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver_endpoint(
    driver_in: DriverCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_driver(db, driver_in)


@router.put("/{driver_id}", response_model=DriverResponse)
def update_driver_endpoint(
    driver_id: int,
    driver_in: DriverUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_driver(db, driver_id, driver_in)


@router.delete("/{driver_id}", response_model=DriverResponse)
def delete_driver_endpoint(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_driver(db, driver_id)
