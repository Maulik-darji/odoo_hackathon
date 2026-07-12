from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.driver import Driver, DriverStatusEnum
from app.models.expense import Expense, ExpenseTypeEnum
from app.models.maintenance import Maintenance, MaintenanceStatusEnum
from app.models.trip import Trip, TripStatusEnum
from app.models.user import User, RoleEnum
from app.models.vehicle import Vehicle, VehicleStatusEnum, VehicleTypeEnum
from app.core.security import get_password_hash

router = APIRouter()

now = datetime.now(timezone.utc)


@router.post("/", summary="Seed demo data (idempotent — only runs when tables are empty)")
def seed_demo_data(db: Session = Depends(get_db)):
    # Only seed if completely empty
    if db.query(Vehicle).count() > 0:
        return {"status": "skipped", "detail": "Data already exists — seed was not re-run."}

    # ── Users ───────────────────────────────────────────────────────────
    user_data = [
        dict(email="admin@transitops.com", name="Admin User",
             password_hash=get_password_hash("admin123"), role=RoleEnum.FLEET_MANAGER, is_admin=True, is_approved=True),
        dict(email="manager@transitops.com", name="Alice Manager",
             password_hash=get_password_hash("demo123"), role=RoleEnum.FLEET_MANAGER, is_approved=True),
        dict(email="dispatcher@transitops.com", name="Bob Dispatcher",
             password_hash=get_password_hash("demo123"), role=RoleEnum.DISPATCHER, is_approved=True),
        dict(email="safety@transitops.com", name="Carol Safety",
             password_hash=get_password_hash("demo123"), role=RoleEnum.SAFETY_OFFICER, is_approved=True),
        dict(email="finance@transitops.com", name="Dave Finance",
             password_hash=get_password_hash("demo123"), role=RoleEnum.FINANCIAL_ANALYST, is_approved=True),
    ]
    users = []
    for ud in user_data:
        existing = db.query(User).filter(User.email == ud["email"]).first()
        if existing:
            users.append(existing)
        else:
            u = User(**ud)
            db.add(u)
            db.flush()
            users.append(u)

    # ── Vehicles ────────────────────────────────────────────────────────
    vehicles = [
        Vehicle(registration_number="MH01AB1234", make="Tata",   model="Prima 4928.S", vehicle_type=VehicleTypeEnum.TRUCK, capacity=20000.0, acquisition_cost=2500000.0, status=VehicleStatusEnum.AVAILABLE,  odometer=45200.0),
        Vehicle(registration_number="MH02CD5678", make="Ashok",  model="Leyland 2518", vehicle_type=VehicleTypeEnum.TRUCK, capacity=18000.0, acquisition_cost=2200000.0, status=VehicleStatusEnum.AVAILABLE,  odometer=62100.0),
        Vehicle(registration_number="MH03EF9012", make="Eicher", model="Pro 6016",     vehicle_type=VehicleTypeEnum.TRUCK, capacity=10000.0, acquisition_cost=1800000.0, status=VehicleStatusEnum.IN_SHOP, odometer=30500.0),
        Vehicle(registration_number="GJ01GH3456", make="Tata",   model="Ultra 1918",   vehicle_type=VehicleTypeEnum.VAN,   capacity=15000.0, acquisition_cost=1500000.0, status=VehicleStatusEnum.AVAILABLE,  odometer=18900.0),
        Vehicle(registration_number="GJ02IJ7890", make="BharatBenz", model="1217C",    vehicle_type=VehicleTypeEnum.TRUCK, capacity=12000.0, acquisition_cost=2000000.0, status=VehicleStatusEnum.AVAILABLE,  odometer=55400.0),
        Vehicle(registration_number="RJ01KL1122", make="Mahindra", model="Blazo X 35", vehicle_type=VehicleTypeEnum.TRAILER, capacity=14000.0, acquisition_cost=2800000.0, status=VehicleStatusEnum.RETIRED,  odometer=210000.0),
    ]
    db.add_all(vehicles)
    db.flush()

    # ── Drivers ─────────────────────────────────────────────────────────
    drivers = [
        Driver(name="Ravi Kumar",    license_number="MH0120230001", license_category="C", license_expiry=now + timedelta(days=365),  contact_number="+91-9876543210", safety_score=92.5, status=DriverStatusEnum.AVAILABLE),
        Driver(name="Suresh Patel",  license_number="GJ0120220045", license_category="C", license_expiry=now + timedelta(days=180),  contact_number="+91-9876543211", safety_score=88.0, status=DriverStatusEnum.AVAILABLE),
        Driver(name="Anand Sharma",  license_number="RJ0120210078", license_category="D", license_expiry=now + timedelta(days=730),  contact_number="+91-9876543212", safety_score=95.0, status=DriverStatusEnum.AVAILABLE),
        Driver(name="Vijay Singh",   license_number="MH0220240100", license_category="C", license_expiry=now + timedelta(days=540),  contact_number="+91-9876543213", safety_score=78.5, status=DriverStatusEnum.OFF_DUTY),
        Driver(name="Mohan Yadav",   license_number="GJ0220190033", license_category="B", license_expiry=now + timedelta(days=90),   contact_number="+91-9876543214", safety_score=85.0, status=DriverStatusEnum.AVAILABLE),
        Driver(name="Deepak Joshi",  license_number="RJ0220230055", license_category="C", license_expiry=now + timedelta(days=400),  contact_number="+91-9876543215", safety_score=60.0, status=DriverStatusEnum.SUSPENDED),
    ]
    db.add_all(drivers)
    db.flush()

    # ── Trips ───────────────────────────────────────────────────────────
    trips = [
        Trip(vehicle_id=vehicles[0].id, driver_id=drivers[0].id,
             source="Mumbai", destination="Pune", planned_distance=150.0,
             start_time=now - timedelta(days=5),  end_time=now - timedelta(days=4),
             status=TripStatusEnum.COMPLETED, cargo_weight=18000.0, route_details="Via Expressway"),
        Trip(vehicle_id=vehicles[1].id, driver_id=drivers[1].id,
             source="Ahmedabad", destination="Surat", planned_distance=265.0,
             start_time=now - timedelta(days=3),  end_time=now - timedelta(days=2),
             status=TripStatusEnum.COMPLETED, cargo_weight=15000.0, route_details="NH48"),
        Trip(vehicle_id=vehicles[3].id, driver_id=drivers[2].id,
             source="Jaipur", destination="Delhi", planned_distance=280.0,
             start_time=now - timedelta(hours=6), end_time=None,
             status=TripStatusEnum.DISPATCHED, cargo_weight=12000.0, route_details="NH48 via Gurgaon"),
        Trip(vehicle_id=vehicles[4].id, driver_id=drivers[4].id,
             source="Surat", destination="Vadodara", planned_distance=165.0,
             start_time=now + timedelta(days=1),  end_time=None,
             status=TripStatusEnum.DRAFT, cargo_weight=10000.0, route_details="NH8"),
        Trip(vehicle_id=vehicles[0].id, driver_id=drivers[0].id,
             source="Mumbai", destination="Nashik", planned_distance=170.0,
             start_time=now - timedelta(days=15), end_time=now - timedelta(days=14),
             status=TripStatusEnum.COMPLETED, cargo_weight=17000.0, route_details="Via Kasara Ghat"),
        Trip(vehicle_id=vehicles[1].id, driver_id=drivers[1].id,
             source="Rajkot", destination="Ahmedabad", planned_distance=220.0,
             start_time=now - timedelta(days=20), end_time=now - timedelta(days=19),
             status=TripStatusEnum.COMPLETED, cargo_weight=14000.0, route_details="NH27"),
        Trip(vehicle_id=vehicles[4].id, driver_id=drivers[4].id,
             source="Baroda", destination="Surat", planned_distance=160.0,
             start_time=now - timedelta(days=10), end_time=now - timedelta(days=9),
             status=TripStatusEnum.COMPLETED, cargo_weight=11500.0, route_details="NH48"),
        Trip(vehicle_id=vehicles[3].id, driver_id=drivers[2].id,
             source="Delhi", destination="Agra", planned_distance=230.0,
             start_time=now - timedelta(days=8),  end_time=now - timedelta(days=7),
             status=TripStatusEnum.CANCELLED, cargo_weight=9000.0, route_details="Yamuna Expressway"),
    ]
    db.add_all(trips)
    db.flush()

    # Set dispatched trip vehicles/drivers to On Trip
    vehicles[3].status = VehicleStatusEnum.ON_TRIP   # Jaipur→Delhi trip
    drivers[2].status = DriverStatusEnum.ON_TRIP

    # ── Expenses ─────────────────────────────────────────────────────────
    expenses = [
        Expense(type=ExpenseTypeEnum.FUEL,        amount=8500.0,  liters=100.0, date=now - timedelta(days=5),  vehicle_id=vehicles[0].id, trip_id=trips[0].id,  description="Diesel fill-up Mumbai"),
        Expense(type=ExpenseTypeEnum.TOLL,        amount=1200.0,  date=now - timedelta(days=4),  vehicle_id=vehicles[0].id, trip_id=trips[0].id,  description="Highway toll Mumbai-Pune"),
        Expense(type=ExpenseTypeEnum.FUEL,        amount=7200.0,  liters=85.0,  date=now - timedelta(days=3),  vehicle_id=vehicles[1].id, trip_id=trips[1].id,  description="Diesel fill-up Ahmedabad"),
        Expense(type=ExpenseTypeEnum.MAINTENANCE, amount=15000.0, date=now - timedelta(days=12), vehicle_id=vehicles[2].id, description="Engine overhaul"),
        Expense(type=ExpenseTypeEnum.OTHER,       amount=2500.0,  date=now - timedelta(days=2),  vehicle_id=vehicles[3].id, description="Driver allowance"),
        Expense(type=ExpenseTypeEnum.FUEL,        amount=6800.0,  liters=80.0,  date=now - timedelta(days=15), vehicle_id=vehicles[0].id, trip_id=trips[4].id,  description="Diesel fill-up"),
        Expense(type=ExpenseTypeEnum.TOLL,        amount=900.0,   date=now - timedelta(days=20), vehicle_id=vehicles[1].id, trip_id=trips[5].id,  description="Toll charges"),
        Expense(type=ExpenseTypeEnum.FUEL,        amount=5500.0,  liters=65.0,  date=now - timedelta(days=10), vehicle_id=vehicles[4].id, trip_id=trips[6].id,  description="Diesel fill-up Baroda"),
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
            {"email": "admin@transitops.com",       "password": "admin123", "role": "Fleet Manager (Admin)"},
            {"email": "manager@transitops.com",    "password": "demo123", "role": "Fleet Manager"},
            {"email": "dispatcher@transitops.com", "password": "demo123", "role": "Dispatcher"},
            {"email": "safety@transitops.com",     "password": "demo123", "role": "Safety Officer"},
            {"email": "finance@transitops.com",    "password": "demo123", "role": "Financial Analyst"},
        ]
    }
