from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate, MaintenanceResponse
from app.services import maintenance_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[MaintenanceResponse])
def read_maintenances(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return maintenance_service.get_maintenance_logs(db, skip=skip, limit=limit)

@router.post("/", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance(maintenance_in: MaintenanceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return maintenance_service.create_maintenance(db, maintenance_in)

@router.get("/{maintenance_id}", response_model=MaintenanceResponse)
def read_maintenance(maintenance_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    maintenance = maintenance_service.get_maintenance_by_id(db, maintenance_id)
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    return maintenance

@router.put("/{maintenance_id}", response_model=MaintenanceResponse)
def update_maintenance(maintenance_id: int, maintenance_in: MaintenanceUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return maintenance_service.update_maintenance(db, maintenance_id, maintenance_in)

@router.delete("/{maintenance_id}", response_model=MaintenanceResponse)
def delete_maintenance(maintenance_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return maintenance_service.delete_maintenance(db, maintenance_id)
