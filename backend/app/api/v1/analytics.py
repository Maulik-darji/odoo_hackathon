from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.vehicle import Vehicle, VehicleStatusEnum
from app.models.driver import Driver
from app.models.trip import Trip, TripStatusEnum
from app.models.expense import Expense
from app.models.maintenance import Maintenance
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_vehicles = db.query(Vehicle).count()
    active_vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatusEnum.ACTIVE).count()
    in_shop_vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatusEnum.IN_SHOP).count()
    
    total_drivers = db.query(Driver).count()
    
    active_trips = db.query(Trip).filter(Trip.status == TripStatusEnum.IN_PROGRESS).count()
    completed_trips = db.query(Trip).filter(Trip.status == TripStatusEnum.COMPLETED).count()
    
    # Calculate total maintenance costs
    maintenance_cost = db.query(func.sum(Maintenance.cost)).scalar() or 0.0
    # Calculate total fuel / toll expenses
    other_expenses = db.query(func.sum(Expense.amount)).scalar() or 0.0
    total_cost = maintenance_cost + other_expenses

    return {
        "kpis": {
            "vehicle_utilization": f"{int((active_vehicles / total_vehicles * 100)) if total_vehicles > 0 else 0}%",
            "total_fleet_size": total_vehicles,
            "in_shop": in_shop_vehicles,
            "active_trips": active_trips,
            "operational_cost": f"${total_cost:,.2f}",
        },
        "fleet_status": [
            {"name": "Active", "value": active_vehicles},
            {"name": "In Shop", "value": in_shop_vehicles},
            {"name": "Retired", "value": db.query(Vehicle).filter(Vehicle.status == VehicleStatusEnum.RETIRED).count()},
        ],
        "recent_activity": [] # We can populate this with recent completed trips
    }
