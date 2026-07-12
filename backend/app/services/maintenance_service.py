from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.maintenance import Maintenance, MaintenanceStatusEnum
from app.models.vehicle import Vehicle, VehicleStatusEnum
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate


def get_maintenance_records(db: Session, skip: int = 0, limit: int = 100) -> list[Maintenance]:
    return db.query(Maintenance).offset(skip).limit(limit).all()


def get_maintenance_by_id(db: Session, maintenance_id: int) -> Maintenance | None:
    return db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()


def _get_vehicle_or_404(db: Session, vehicle_id: int) -> Vehicle:
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle {vehicle_id} not found.",
        )
    return vehicle


def _sync_vehicle_status(db: Session, vehicle_id: int, maint_status: MaintenanceStatusEnum) -> None:
    """Automatically toggle the vehicle status based on maintenance lifecycle."""
    vehicle = _get_vehicle_or_404(db, vehicle_id)

    # Rule: Creating maintenance → vehicle status becomes In Shop
    if maint_status in {MaintenanceStatusEnum.SCHEDULED, MaintenanceStatusEnum.IN_PROGRESS}:
        vehicle.status = VehicleStatusEnum.IN_SHOP
    elif maint_status == MaintenanceStatusEnum.COMPLETED:
        # Rule: Closing maintenance restores to Available (unless retired)
        # Only flip back if there are no other open maintenance records
        open_count = (
            db.query(Maintenance)
            .filter(
                Maintenance.vehicle_id == vehicle_id,
                Maintenance.status.in_([
                    MaintenanceStatusEnum.SCHEDULED,
                    MaintenanceStatusEnum.IN_PROGRESS,
                ]),
            )
            .count()
        )
        if open_count == 0 and vehicle.status != VehicleStatusEnum.RETIRED:
            vehicle.status = VehicleStatusEnum.AVAILABLE


def create_maintenance(db: Session, maint_in: MaintenanceCreate) -> Maintenance:
    _get_vehicle_or_404(db, maint_in.vehicle_id)

    if maint_in.end_date and maint_in.end_date < maint_in.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maintenance end date must be after the start date.",
        )

    db_maint = Maintenance(**maint_in.model_dump())
    db.add(db_maint)
    db.flush()  # get the id before syncing vehicle status

    _sync_vehicle_status(db, maint_in.vehicle_id, db_maint.status)

    db.commit()
    db.refresh(db_maint)
    return db_maint


def update_maintenance(db: Session, maintenance_id: int, maint_in: MaintenanceUpdate) -> Maintenance:
    db_maint = get_maintenance_by_id(db, maintenance_id)
    if not db_maint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance record not found.",
        )

    update_data = maint_in.model_dump(exclude_unset=True)

    if "vehicle_id" in update_data:
        _get_vehicle_or_404(db, update_data["vehicle_id"])

    # Validate date ordering
    start = update_data.get("start_date", db_maint.start_date)
    end = update_data.get("end_date", db_maint.end_date)
    if end and end < start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maintenance end date must be after the start date.",
        )

    for key, value in update_data.items():
        setattr(db_maint, key, value)

    _sync_vehicle_status(db, db_maint.vehicle_id, db_maint.status)

    db.commit()
    db.refresh(db_maint)
    return db_maint


def delete_maintenance(db: Session, maintenance_id: int) -> Maintenance:
    db_maint = get_maintenance_by_id(db, maintenance_id)
    if not db_maint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance record not found.",
        )

    vehicle_id = db_maint.vehicle_id
    db.delete(db_maint)
    db.flush()

    # After deleting, check if the vehicle should be set back to Available
    open_count = (
        db.query(Maintenance)
        .filter(
            Maintenance.vehicle_id == vehicle_id,
            Maintenance.status.in_([
                MaintenanceStatusEnum.SCHEDULED,
                MaintenanceStatusEnum.IN_PROGRESS,
            ]),
        )
        .count()
    )
    if open_count == 0:
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if vehicle and vehicle.status == VehicleStatusEnum.IN_SHOP:
            vehicle.status = VehicleStatusEnum.AVAILABLE

    db.commit()
    return db_maint
