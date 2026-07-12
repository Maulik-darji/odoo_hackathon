from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.driver import Driver, DriverStatusEnum
from app.models.trip import Trip, TripStatusEnum
from app.models.vehicle import Vehicle, VehicleStatusEnum
from app.schemas.trip import TripCreate, TripUpdate


def get_trips(db: Session, skip: int = 0, limit: int = 100) -> list[Trip]:
    return db.query(Trip).offset(skip).limit(limit).all()


def get_trip_by_id(db: Session, trip_id: int) -> Trip | None:
    return db.query(Trip).filter(Trip.id == trip_id).first()


def _get_vehicle_or_404(db: Session, vehicle_id: int) -> Vehicle:
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle {vehicle_id} not found.",
        )
    return vehicle


def _get_driver_or_404(db: Session, driver_id: int) -> Driver:
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Driver {driver_id} not found.",
        )
    return driver


def _validate_trip_rules(
    db: Session,
    *,
    vehicle_id: int,
    driver_id: int,
    cargo_weight: float,
    status_value: TripStatusEnum,
    start_time,
    end_time,
    exclude_trip_id: int | None = None,
) -> None:
    vehicle = _get_vehicle_or_404(db, vehicle_id)
    driver = _get_driver_or_404(db, driver_id)

    if cargo_weight > vehicle.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cargo weight exceeds the vehicle capacity.",
        )

    if end_time and end_time < start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trip end time must be after the start time.",
        )

    if status_value in {TripStatusEnum.PLANNED, TripStatusEnum.IN_PROGRESS}:
        if vehicle.status != VehicleStatusEnum.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only active vehicles can be assigned to planned or in-progress trips.",
            )
        if driver.status != DriverStatusEnum.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only active drivers can be assigned to planned or in-progress trips.",
            )

    if status_value == TripStatusEnum.IN_PROGRESS:
        active_trips = db.query(Trip).filter(Trip.status == TripStatusEnum.IN_PROGRESS).all()
        for active_trip in active_trips:
            if exclude_trip_id is not None and active_trip.id == exclude_trip_id:
                continue
            if active_trip.vehicle_id == vehicle_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This vehicle is already assigned to an in-progress trip.",
                )
            if active_trip.driver_id == driver_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This driver is already assigned to an in-progress trip.",
                )

    if status_value == TripStatusEnum.COMPLETED and end_time is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed trips require an end time.",
        )


def create_trip(db: Session, trip_in: TripCreate) -> Trip:
    _validate_trip_rules(
        db,
        vehicle_id=trip_in.vehicle_id,
        driver_id=trip_in.driver_id,
        cargo_weight=trip_in.cargo_weight,
        status_value=trip_in.status,
        start_time=trip_in.start_time,
        end_time=trip_in.end_time,
    )

    db_trip = Trip(**trip_in.model_dump())
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip


def update_trip(db: Session, trip_id: int, trip_in: TripUpdate) -> Trip:
    db_trip = get_trip_by_id(db, trip_id)
    if not db_trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found.",
        )

    update_data = trip_in.model_dump(exclude_unset=True)
    candidate = {
        "vehicle_id": update_data.get("vehicle_id", db_trip.vehicle_id),
        "driver_id": update_data.get("driver_id", db_trip.driver_id),
        "cargo_weight": update_data.get("cargo_weight", db_trip.cargo_weight),
        "status_value": update_data.get("status", db_trip.status),
        "start_time": update_data.get("start_time", db_trip.start_time),
        "end_time": update_data.get("end_time", db_trip.end_time),
    }

    _validate_trip_rules(db, exclude_trip_id=trip_id, **candidate)

    for key, value in update_data.items():
        setattr(db_trip, key, value)

    db.commit()
    db.refresh(db_trip)
    return db_trip


def delete_trip(db: Session, trip_id: int) -> Trip:
    db_trip = get_trip_by_id(db, trip_id)
    if not db_trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found.",
        )

    db.delete(db_trip)
    db.commit()
    return db_trip
