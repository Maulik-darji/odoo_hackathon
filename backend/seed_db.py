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
        # Clear existing data to ensure only seeded data remains (excluding admin users)
        print("Clearing old mock data...")
        db.query(Expense).delete()
        db.query(Maintenance).delete()
        db.query(Trip).delete()
        db.query(Driver).delete()
        db.query(Vehicle).delete()
        db.query(User).filter(User.is_admin == False).delete()
        db.commit()

        # Create 20 Users
        print("Creating 20 Users...")
        roles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"]
        hashed_password = get_password_hash("Nanaji@9090")
        
        users = []
        for i in range(20):
            name = fake.name()
            # Clean name for email: remove titles like Dr., Mr. and make lowercase
            clean_name = name.lower().replace("dr. ", "").replace("mr. ", "").replace("mrs. ", "").replace("ms. ", "").replace("miss ", "")
            email_prefix = clean_name.replace(" ", ".").replace("'", "")
            
            user = User(
                email=f"{email_prefix}@transitops.com",
                password_hash=hashed_password,
                name=name,
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
            
            route_details = random.choice([
                "NH48 Express Route - Smooth transit",
                "State Highway 12 - Heavy traffic detour",
                "Direct route via National Highway",
                "Night transit route - well lit",
                "Route adjusted for weather conditions",
                "Alternate bypass route taken"
            ])
            
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
                route_details=route_details,
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
            
            description = random.choice([
                "Routine Oil Change & Filter Replacement",
                "Engine diagnostics and tune-up",
                "Brake pads replacement and rotor check",
                "Tire rotation and wheel alignment",
                "AC servicing and cabin filter check",
                "Transmission fluid flush",
                "Suspension check and shocks replacement",
                "Battery replacement and electrical check"
            ])
            
            log = Maintenance(
                vehicle_id=random.choice(vehicles).id,
                start_date=start_date,
                end_date=end_date,
                status=status,
                description=description,
                cost=random.uniform(100, 2500)
            )
            db.add(log)
            
        # Create 20 Expenses
        print("Creating 20 Expenses...")
        for i in range(20):
            exp_type = random.choice(list(ExpenseTypeEnum))
            amount = random.uniform(20, 800)
            liters = random.uniform(50, 400) if exp_type == ExpenseTypeEnum.FUEL else None
            
            if exp_type == ExpenseTypeEnum.FUEL:
                desc = f"Fuel Refill - {random.choice(['Bharat Petroleum', 'Indian Oil', 'HP Value', 'Reliance Petroleum'])}"
            elif exp_type == ExpenseTypeEnum.TOLL:
                desc = f"Highway Toll Tax - {random.choice(['NH48 Toll Plaza', 'Yamuna Expressway', 'FASTag Online'])}"
            elif exp_type == ExpenseTypeEnum.MAINTENANCE:
                desc = f"Quick Maintenance - {random.choice(['Oil top-up', 'Wiper change', 'Tire inflation check'])}"
            else:
                desc = random.choice(["Driver Meals Allowance", "Parking Fees - City Depot", "State Border Permit Tax"])
            
            expense = Expense(
                type=exp_type,
                amount=amount,
                liters=liters,
                date=fake.date_time_between(start_date='-30d', end_date='now', tzinfo=timezone.utc),
                vehicle_id=random.choice(vehicles).id,
                trip_id=random.choice(trips).id if random.choice([True, False]) else None,
                description=desc
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
