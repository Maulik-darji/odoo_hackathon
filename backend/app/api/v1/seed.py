from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.driver import Driver, DriverStatusEnum
from app.models.expense import Expense, ExpenseTypeEnum
from app.models.maintenance import Maintenance, MaintenanceStatusEnum
from app.models.trip import Trip, TripStatusEnum
from app.models.user import User, RoleEnum
from app.models.vehicle import Vehicle, VehicleStatusEnum
from app.core.security import get_password_hash

router = APIRouter()

now = datetime.now(timezone.utc)


@router.post("/", summary="Seed demo data (idempotent — only runs when tables are empty)")
def seed_demo_data(db: Session = Depends(get_db)):
    # Only seed if completely empty
    if db.query(Vehicle).count() > 0:
        return {"status": "skipped", "detail": "Data already exists — seed was not re-run."}

    # ── Users ───────────────────────────────────────────────────────────
    users = [
        User(email="manager@transitops.com", name="Alice Manager",
             password_hash=get_password_hash("demo123"), role=RoleEnum.FLEET_MANAGER),
        User(email="dispatcher@transitops.com", name="Bob Dispatcher",
             password_hash=get_password_hash("demo123"), role=RoleEnum.DISPATCHER),
        User(email="safety@transitops.com", name="Carol Safety",
             password_hash=get_password_hash("demo123"), role=RoleEnum.SAFETY_OFFICER),
        User(email="finance@transitops.com", name="Dave Finance",
             password_hash=get_password_hash("demo123"), role=RoleEnum.FINANCIAL_ANALYST),
    ]
    db.add_all(users)
    db.flush()

    # ── Vehicles ────────────────────────────────────────────────────────
    vehicles = [
        Vehicle(registration_number="MH01AB1234", make="Tata",   model="Prima 4928.S", capacity=20000.0, status=VehicleStatusEnum.ACTIVE,  mileage=45200.0),
        Vehicle(registration_number="MH02CD5678", make="Ashok",  model="Leyland 2518", capacity=18000.0, status=VehicleStatusEnum.ACTIVE,  mileage=62100.0),
        Vehicle(registration_number="MH03EF9012", make="Eicher", model="Pro 6016",     capacity=10000.0, status=VehicleStatusEnum.IN_SHOP, mileage=30500.0),
        Vehicle(registration_number="GJ01GH3456", make="Tata",   model="Ultra 1918",   capacity=15000.0, status=VehicleStatusEnum.ACTIVE,  mileage=18900.0),
        Vehicle(registration_number="GJ02IJ7890", make="BharatBenz", model="1217C",   capacity=12000.0, status=VehicleStatusEnum.ACTIVE,  mileage=55400.0),
        Vehicle(registration_number="RJ01KL1122", make="Mahindra", model="Blazo X 35",capacity=14000.0, status=VehicleStatusEnum.RETIRED,  mileage=210000.0),
    ]
    db.add_all(vehicles)
    db.flush()

    # ── Drivers ─────────────────────────────────────────────────────────
    drivers = [
        Driver(name="Ravi Kumar",    license_number="MH0120230001", license_expiry=now + timedelta(days=365),  status=DriverStatusEnum.ACTIVE),
        Driver(name="Suresh Patel",  license_number="GJ0120220045", license_expiry=now + timedelta(days=180),  status=DriverStatusEnum.ACTIVE),
        Driver(name="Anand Sharma",  license_number="RJ0120210078", license_expiry=now + timedelta(days=730),  status=DriverStatusEnum.ACTIVE),
        Driver(name="Vijay Singh",   license_number="MH0220240100", license_expiry=now + timedelta(days=540),  status=DriverStatusEnum.OFF_DUTY),
        Driver(name="Mohan Yadav",   license_number="GJ0220190033", license_expiry=now + timedelta(days=90),   status=DriverStatusEnum.ACTIVE),
        Driver(name="Deepak Joshi",  license_number="RJ0220230055", license_expiry=now + timedelta(days=400),  status=DriverStatusEnum.SUSPENDED),
    ]
    db.add_all(drivers)
    db.flush()

    # ── Trips ───────────────────────────────────────────────────────────
    trips = [
        Trip(vehicle_id=vehicles[0].id, driver_id=drivers[0].id,
             start_time=now - timedelta(days=5),  end_time=now - timedelta(days=4),
             status=TripStatusEnum.COMPLETED, cargo_weight=18000.0, route_details="Mumbai → Pune"),
        Trip(vehicle_id=vehicles[1].id, driver_id=drivers[1].id,
             start_time=now - timedelta(days=3),  end_time=now - timedelta(days=2),
             status=TripStatusEnum.COMPLETED, cargo_weight=15000.0, route_details="Ahmedabad → Surat"),
        Trip(vehicle_id=vehicles[3].id, driver_id=drivers[2].id,
             start_time=now - timedelta(hours=6), end_time=None,
             status=TripStatusEnum.IN_PROGRESS, cargo_weight=12000.0, route_details="Jaipur → Delhi"),
        Trip(vehicle_id=vehicles[4].id, driver_id=drivers[4].id,
             start_time=now + timedelta(days=1),  end_time=None,
             status=TripStatusEnum.PLANNED, cargo_weight=10000.0, route_details="Surat → Vadodara"),
        Trip(vehicle_id=vehicles[0].id, driver_id=drivers[0].id,
             start_time=now - timedelta(days=15), end_time=now - timedelta(days=14),
             status=TripStatusEnum.COMPLETED, cargo_weight=17000.0, route_details="Mumbai → Nashik"),
        Trip(vehicle_id=vehicles[1].id, driver_id=drivers[1].id,
             start_time=now - timedelta(days=20), end_time=now - timedelta(days=19),
             status=TripStatusEnum.COMPLETED, cargo_weight=14000.0, route_details="Rajkot → Ahmedabad"),
        Trip(vehicle_id=vehicles[4].id, driver_id=drivers[4].id,
             start_time=now - timedelta(days=10), end_time=now - timedelta(days=9),
             status=TripStatusEnum.COMPLETED, cargo_weight=11500.0, route_details="Baroda → Surat"),
        Trip(vehicle_id=vehicles[3].id, driver_id=drivers[2].id,
             start_time=now - timedelta(days=8),  end_time=now - timedelta(days=7),
             status=TripStatusEnum.CANCELLED, cargo_weight=9000.0, route_details="Delhi → Agra"),
    ]
    db.add_all(trips)
    db.flush()

    # ── Expenses ─────────────────────────────────────────────────────────
    expenses = [
        Expense(type=ExpenseTypeEnum.FUEL,        amount=8500.0,  date=now - timedelta(days=5),  vehicle_id=vehicles[0].id, trip_id=trips[0].id,  description="Diesel fill-up Mumbai"),
        Expense(type=ExpenseTypeEnum.TOLL,        amount=1200.0,  date=now - timedelta(days=4),  vehicle_id=vehicles[0].id, trip_id=trips[0].id,  description="Highway toll Mumbai-Pune"),
        Expense(type=ExpenseTypeEnum.FUEL,        amount=7200.0,  date=now - timedelta(days=3),  vehicle_id=vehicles[1].id, trip_id=trips[1].id,  description="Diesel fill-up Ahmedabad"),
        Expense(type=ExpenseTypeEnum.MAINTENANCE, amount=15000.0, date=now - timedelta(days=12), vehicle_id=vehicles[2].id, description="Engine overhaul"),
        Expense(type=ExpenseTypeEnum.OTHER,       amount=2500.0,  date=now - timedelta(days=2),  vehicle_id=vehicles[3].id, description="Driver allowance"),
        Expense(type=ExpenseTypeEnum.FUEL,        amount=6800.0,  date=now - timedelta(days=15), vehicle_id=vehicles[0].id, trip_id=trips[4].id,  description="Diesel fill-up"),
        Expense(type=ExpenseTypeEnum.TOLL,        amount=900.0,   date=now - timedelta(days=20), vehicle_id=vehicles[1].id, trip_id=trips[5].id,  description="Toll charges"),
        Expense(type=ExpenseTypeEnum.FUEL,        amount=5500.0,  date=now - timedelta(days=10), vehicle_id=vehicles[4].id, trip_id=trips[6].id,  description="Diesel fill-up Baroda"),
    ]
    db.add_all(expenses)
    db.flush()

    # ── Maintenance ──────────────────────────────────────────────────────
    maintenance_records = [
        Maintenance(vehicle_id=vehicles[2].id, description="Engine overhaul and oil change",
                    cost=25000.0, start_date=now - timedelta(days=7), end_date=None,
                    status=MaintenanceStatusEnum.IN_PROGRESS),
        Maintenance(vehicle_id=vehicles[0].id, description="Scheduled tyre rotation",
                    cost=3500.0, start_date=now + timedelta(days=10), end_date=now + timedelta(days=10),
                    status=MaintenanceStatusEnum.SCHEDULED),
        Maintenance(vehicle_id=vehicles[1].id, description="Brake pad replacement",
                    cost=8000.0, start_date=now - timedelta(days=30), end_date=now - timedelta(days=28),
                    status=MaintenanceStatusEnum.COMPLETED),
        Maintenance(vehicle_id=vehicles[5].id, description="Full vehicle inspection before retirement",
                    cost=12000.0, start_date=now - timedelta(days=60), end_date=now - timedelta(days=55),
                    status=MaintenanceStatusEnum.COMPLETED),
    ]
    db.add_all(maintenance_records)
    db.commit()

    return {
        "status": "success",
        "seeded": {
            "users": len(users),
            "vehicles": len(vehicles),
            "drivers": len(drivers),
            "trips": len(trips),
            "expenses": len(expenses),
            "maintenance": len(maintenance_records),
        },
        "demo_accounts": [
            {"email": "manager@transitops.com",    "password": "demo123", "role": "Fleet Manager"},
            {"email": "dispatcher@transitops.com", "password": "demo123", "role": "Dispatcher"},
            {"email": "safety@transitops.com",     "password": "demo123", "role": "Safety Officer"},
            {"email": "finance@transitops.com",    "password": "demo123", "role": "Financial Analyst"},
        ]
    }
