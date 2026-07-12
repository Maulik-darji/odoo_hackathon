import os
import sys
import random
from datetime import datetime, timedelta, timezone

# Add the project root to the python path so imports work correctly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleTypeEnum, VehicleStatusEnum
from app.models.driver import Driver, DriverStatusEnum
from app.models.trip import Trip, TripStatusEnum
from app.models.maintenance import Maintenance, MaintenanceStatusEnum
from app.models.expense import Expense, ExpenseTypeEnum
from app.core.security import get_password_hash
from faker import Faker

fake = Faker('en_IN')

def seed_database():
    print("Starting database seeding process...")
    db: Session = SessionLocal()
    
    try:
        # Create 20 Users
        print("Creating 20 Users...")
        roles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"]
        hashed_password = get_password_hash("Nanaji@9090")
        
        users = []
        for i in range(20):
            user = User(
                email=f"user{i+1}_{fake.user_name()}@transitops.com",
                password_hash=hashed_password,
                name=fake.name(),
                role=random.choice(roles),
                tour_completed=True,
                is_approved=True,
                is_admin=False
            )
            db.add(user)
            users.append(user)
        
        db.commit()
        
        # Create 20 Vehicles
        print("Creating 20 Vehicles...")
        makes = ["Volvo", "Scania", "Mercedes-Benz", "MAN", "Ford", "Chevrolet"]
        regions = ["National", "North", "South", "East", "West"]
        
        vehicles = []
        indian_states = ["MH", "GJ", "DL", "KA", "TN", "UP", "RJ", "WB", "AP", "TS"]
        for i in range(20):
            state = random.choice(indian_states)
            rto = f"{random.randint(1, 99):02d}"
            chars = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=2))
            nums = f"{random.randint(1, 9999):04d}"
            reg_number = f"{state}-{rto}-{chars}-{nums}"
            
            vehicle = Vehicle(
                registration_number=reg_number,
                make=random.choice(makes),
                model=fake.word().capitalize(),
                vehicle_type=random.choice(list(VehicleTypeEnum)).value,
                capacity=random.uniform(2000, 20000), # kg
                odometer=random.uniform(1000, 150000),
                acquisition_cost=random.uniform(30000, 120000),
                status=random.choice(list(VehicleStatusEnum)).value,
                region=random.choice(regions)
            )
            db.add(vehicle)
            vehicles.append(vehicle)
            
        db.commit()
        for v in vehicles: db.refresh(v)
        
        # Create 20 Drivers
        print("Creating 20 Drivers...")
        categories = ["CDL-A", "CDL-B", "Class 1", "Class 2"]
        
        drivers = []
        for i in range(20):
            driver = Driver(
                name=fake.name(),
                license_number=fake.bothify(text='DL-#########').upper(),
                license_category=random.choice(categories),
                license_expiry=datetime.now(timezone.utc) + timedelta(days=random.randint(30, 1000)),
                contact_number=fake.phone_number(),
                safety_score=random.uniform(70, 100),
                status=random.choice(list(DriverStatusEnum)).value
            )
            db.add(driver)
            drivers.append(driver)
            
        db.commit()
        for d in drivers: db.refresh(d)
        
        # Create 20 Trips
        print("Creating 20 Trips...")
        trips = []
        for i in range(20):
            start_time = fake.date_time_between(start_date='-30d', end_date='+5d', tzinfo=timezone.utc)
            status = random.choice(list(TripStatusEnum)).value
            end_time = start_time + timedelta(hours=random.randint(2, 48)) if status == "Completed" else None
            
            trip = Trip(
                vehicle_id=random.choice(vehicles).id,
                driver_id=random.choice(drivers).id,
                source=fake.city(),
                destination=fake.city(),
                cargo_weight=random.uniform(500, 15000),
                planned_distance=random.uniform(50, 1500),
                start_time=start_time,
                end_time=end_time,
                status=status,
                route_details=fake.sentence(),
                revenue=random.uniform(1000, 8000)
            )
            db.add(trip)
            trips.append(trip)
            
        db.commit()
        for t in trips: db.refresh(t)
        
        # Create 20 Maintenance Logs
        print("Creating 20 Maintenance Logs...")
        for i in range(20):
            start_date = fake.date_time_between(start_date='-60d', end_date='now', tzinfo=timezone.utc)
            status = random.choice(list(MaintenanceStatusEnum)).value
            end_date = start_date + timedelta(days=random.randint(1, 10)) if status == "Completed" else None
            
            log = Maintenance(
                vehicle_id=random.choice(vehicles).id,
                start_date=start_date,
                end_date=end_date,
                status=status,
                description=fake.sentence(),
                cost=random.uniform(100, 2500)
            )
            db.add(log)
            
        # Create 20 Expenses
        print("Creating 20 Expenses...")
        for i in range(20):
            exp_type = random.choice(list(ExpenseTypeEnum))
            amount = random.uniform(20, 800)
            liters = random.uniform(50, 400) if exp_type == ExpenseTypeEnum.FUEL else None
            
            expense = Expense(
                type=exp_type,
                amount=amount,
                liters=liters,
                date=fake.date_time_between(start_date='-30d', end_date='now', tzinfo=timezone.utc),
                vehicle_id=random.choice(vehicles).id,
                trip_id=random.choice(trips).id if random.choice([True, False]) else None,
                description=fake.sentence()
            )
            db.add(expense)
            
        db.commit()
        print("Database successfully seeded with 20 entities each!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
