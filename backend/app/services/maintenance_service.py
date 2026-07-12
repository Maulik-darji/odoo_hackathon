from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.maintenance import Maintenance, MaintenanceStatusEnum
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate
from app.services.vehicle_service import get_vehicle_by_id
from app.models.vehicle import VehicleStatusEnum

def get_maintenance_logs(db: Session, skip: int = 0, limit: int = 100) -> list[Maintenance]:
    return db.query(Maintenance).offset(skip).limit(limit).all()

def get_maintenance_by_id(db: Session, maintenance_id: int) -> Maintenance | None:
    return db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()

def create_maintenance(db: Session, maintenance_in: MaintenanceCreate) -> Maintenance:
    vehicle = get_vehicle_by_id(db, maintenance_in.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=400, detail="Vehicle not found.")
        
    db_maintenance = Maintenance(**maintenance_in.model_dump())
    db.add(db_maintenance)
    
    if db_maintenance.status == MaintenanceStatusEnum.IN_PROGRESS:
        vehicle.status = VehicleStatusEnum.IN_SHOP
        
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance

def update_maintenance(db: Session, maintenance_id: int, maintenance_in: MaintenanceUpdate) -> Maintenance:
    db_maintenance = get_maintenance_by_id(db, maintenance_id)
    if not db_maintenance:
        raise HTTPException(status_code=404, detail="Maintenance log not found.")
    
    update_data = maintenance_in.model_dump(exclude_unset=True)
    
    # Check if we are updating vehicle status based on maintenance status
    if "status" in update_data and update_data["status"] != db_maintenance.status:
        vehicle = get_vehicle_by_id(db, db_maintenance.vehicle_id)
        if vehicle:
            if update_data["status"] == MaintenanceStatusEnum.IN_PROGRESS:
                vehicle.status = VehicleStatusEnum.IN_SHOP
            elif update_data["status"] == MaintenanceStatusEnum.COMPLETED and vehicle.status == VehicleStatusEnum.IN_SHOP:
                vehicle.status = VehicleStatusEnum.ACTIVE
                
    for key, value in update_data.items():
        setattr(db_maintenance, key, value)
        
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance

def delete_maintenance(db: Session, maintenance_id: int) -> Maintenance:
    db_maintenance = get_maintenance_by_id(db, maintenance_id)
    if not db_maintenance:
        raise HTTPException(status_code=404, detail="Maintenance log not found.")
    db.delete(db_maintenance)
    db.commit()
    return db_maintenance
