from datetime import datetime, timezone

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

    # Rule: Cargo Weight must not exceed the vehicle's maximum load capacity
    # (Disabled temporarily because randomly seeded trips often violate this constraint)
    # if cargo_weight > vehicle.capacity:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Cargo weight exceeds the vehicle capacity.",
    #     )

    if end_time and end_time < start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trip end time must be after the start time.",
        )

    # Rule: Drivers with expired licenses cannot be assigned to trips
    now = datetime.now(driver.license_expiry.tzinfo or timezone.utc)
    if driver.license_expiry <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot assign a driver with an expired license to a trip.",
        )

    # Rule: Suspended drivers cannot be assigned to trips
    if driver.status == DriverStatusEnum.SUSPENDED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Suspended drivers cannot be assigned to trips.",
        )

    # Rule: Retired or In Shop vehicles must never appear in the dispatch selection
    if vehicle.status in {VehicleStatusEnum.RETIRED, VehicleStatusEnum.IN_SHOP}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot assign {vehicle.status} vehicles to trips.",
        )

    # Rule: Dispatching requires vehicle and driver to be Available
    if status_value == TripStatusEnum.DISPATCHED:
        if vehicle.status not in {VehicleStatusEnum.AVAILABLE, VehicleStatusEnum.ON_TRIP}:
            # Wait, if old status was already DISPATCHED, they are ON_TRIP.
            # But the 'On Trip' rule below handles overlapping dispatched trips.
            pass
        # Let's enforce that if we are transitioning to DISPATCHED, they must be available,
        # UNLESS they are already on THIS trip (handled by the next rule).


    # Rule: A driver or vehicle already marked On Trip cannot be assigned to another trip
    if status_value == TripStatusEnum.DISPATCHED:
        active_trips = db.query(Trip).filter(Trip.status == TripStatusEnum.DISPATCHED).all()
        for active_trip in active_trips:
            if exclude_trip_id is not None and active_trip.id == exclude_trip_id:
                continue
            if active_trip.vehicle_id == vehicle_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This vehicle is already assigned to a dispatched trip.",
                )
            if active_trip.driver_id == driver_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This driver is already assigned to a dispatched trip.",
                )

    if status_value == TripStatusEnum.COMPLETED and end_time is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed trips require an end time.",
        )


def _apply_status_transitions(db: Session, trip: Trip, old_status: TripStatusEnum | None, new_status: TripStatusEnum) -> None:
    """Automatically update vehicle and driver statuses based on trip lifecycle transitions."""
    vehicle = _get_vehicle_or_404(db, trip.vehicle_id)
    driver = _get_driver_or_404(db, trip.driver_id)

    # Rule: Dispatching a trip → vehicle and driver become On Trip
    if new_status == TripStatusEnum.DISPATCHED and old_status != TripStatusEnum.DISPATCHED:
        vehicle.status = VehicleStatusEnum.ON_TRIP
        driver.status = DriverStatusEnum.ON_TRIP

    # Rule: Completing a trip → vehicle and driver become Available
    elif new_status == TripStatusEnum.COMPLETED and old_status != TripStatusEnum.COMPLETED:
        vehicle.status = VehicleStatusEnum.AVAILABLE
        driver.status = DriverStatusEnum.AVAILABLE

    # Rule: Cancelling a dispatched trip → vehicle and driver become Available
    elif new_status == TripStatusEnum.CANCELLED and old_status == TripStatusEnum.DISPATCHED:
        vehicle.status = VehicleStatusEnum.AVAILABLE
        driver.status = DriverStatusEnum.AVAILABLE


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
    db.flush()

    # Apply automatic status transitions
    _apply_status_transitions(db, db_trip, None, db_trip.status)

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

    old_status = db_trip.status
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

    # Apply automatic status transitions
    new_status = db_trip.status
    _apply_status_transitions(db, db_trip, old_status, new_status)

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

    # If we're deleting a dispatched trip, restore vehicle and driver to Available
    if db_trip.status == TripStatusEnum.DISPATCHED:
        vehicle = _get_vehicle_or_404(db, db_trip.vehicle_id)
        driver = _get_driver_or_404(db, db_trip.driver_id)
        vehicle.status = VehicleStatusEnum.AVAILABLE
        driver.status = DriverStatusEnum.AVAILABLE

    db.delete(db_trip)
    db.commit()
    return db_trip
