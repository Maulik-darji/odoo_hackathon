from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.maintenance import MaintenanceCreate, MaintenanceResponse, MaintenanceUpdate
from app.services.maintenance_service import (
    create_maintenance,
    delete_maintenance,
    get_maintenance_by_id,
    get_maintenance_records,
    update_maintenance,
)

router = APIRouter()


@router.get("/", response_model=list[MaintenanceResponse])
def list_maintenance(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_maintenance_records(db, skip=skip, limit=limit)


@router.get("/{maintenance_id}", response_model=MaintenanceResponse)
def get_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = get_maintenance_by_id(db, maintenance_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance record not found.")
    return record


@router.post("/", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance_endpoint(
    maint_in: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_maintenance(db, maint_in)


@router.put("/{maintenance_id}", response_model=MaintenanceResponse)
def update_maintenance_endpoint(
    maintenance_id: int,
    maint_in: MaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_maintenance(db, maintenance_id, maint_in)


@router.delete("/{maintenance_id}", response_model=MaintenanceResponse)
def delete_maintenance_endpoint(
    maintenance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_maintenance(db, maintenance_id)
