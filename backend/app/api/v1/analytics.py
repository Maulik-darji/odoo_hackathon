from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timezone
from app.db.database import get_db
from app.models.vehicle import Vehicle, VehicleStatusEnum
from app.models.driver import Driver, DriverStatusEnum
from app.models.trip import Trip, TripStatusEnum
from app.models.expense import Expense, ExpenseTypeEnum
from app.models.maintenance import Maintenance
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # --- Vehicles ---
    total_vehicles     = db.query(Vehicle).count()
    active_vehicles    = db.query(Vehicle).filter(Vehicle.status == VehicleStatusEnum.ACTIVE).count()
    in_shop_vehicles   = db.query(Vehicle).filter(Vehicle.status == VehicleStatusEnum.IN_SHOP).count()
    retired_vehicles   = db.query(Vehicle).filter(Vehicle.status == VehicleStatusEnum.RETIRED).count()

    # --- Drivers ---
    total_drivers  = db.query(Driver).count()
    active_drivers = db.query(Driver).filter(Driver.status == DriverStatusEnum.ACTIVE).count()

    # --- Trips ---
    total_trips     = db.query(Trip).count()
    planned_trips   = db.query(Trip).filter(Trip.status == TripStatusEnum.PLANNED).count()
    active_trips    = db.query(Trip).filter(Trip.status == TripStatusEnum.IN_PROGRESS).count()
    completed_trips = db.query(Trip).filter(Trip.status == TripStatusEnum.COMPLETED).count()
    cancelled_trips = db.query(Trip).filter(Trip.status == TripStatusEnum.CANCELLED).count()

    # --- Costs ---
    maintenance_cost = db.query(func.sum(Maintenance.cost)).scalar() or 0.0
    other_expenses   = db.query(func.sum(Expense.amount)).scalar() or 0.0
    total_cost       = maintenance_cost + other_expenses

    # --- Expense breakdown by type ---
    expense_breakdown = []
    for exp_type in ExpenseTypeEnum:
        total = db.query(func.sum(Expense.amount)).filter(Expense.type == exp_type).scalar() or 0.0
        expense_breakdown.append({"name": exp_type.value, "value": round(total, 2)})

    # --- Monthly trip trend (last 6 months of completed trips) ---
    now = datetime.now(timezone.utc)
    monthly_trend = []
    for i in range(5, -1, -1):
        # month offset: 0 = current month, 5 = 5 months ago
        month = (now.month - i - 1) % 12 + 1
        year  = now.year - ((now.month - i - 1) // 12)
        count = (
            db.query(Trip)
            .filter(
                Trip.status == TripStatusEnum.COMPLETED,
                extract("month", Trip.created_at) == month,
                extract("year",  Trip.created_at) == year,
            )
            .count()
        )
        monthly_trend.append({
            "month": datetime(year, month, 1).strftime("%b %Y"),
            "trips": count,
        })

    # --- Recent activity: last 10 trips ---
    recent_trips_raw = (
        db.query(Trip)
        .order_by(Trip.created_at.desc())
        .limit(10)
        .all()
    )
    recent_activity = [
        {
            "id": t.id,
            "status": t.status.value,
            "route": t.route_details or "N/A",
            "cargo_weight": t.cargo_weight,
            "start_time": t.start_time.isoformat() if t.start_time else None,
            "vehicle_id": t.vehicle_id,
            "driver_id": t.driver_id,
        }
        for t in recent_trips_raw
    ]

    return {
        "kpis": {
            "vehicle_utilization": f"{int(active_vehicles / total_vehicles * 100) if total_vehicles > 0 else 0}%",
            "total_fleet_size": total_vehicles,
            "active_vehicles": active_vehicles,
            "in_shop": in_shop_vehicles,
            "total_drivers": total_drivers,
            "active_drivers": active_drivers,
            "active_trips": active_trips,
            "total_trips": total_trips,
            "completed_trips": completed_trips,
            "operational_cost": f"${total_cost:,.2f}",
        },
        "fleet_status": [
            {"name": "Active",   "value": active_vehicles},
            {"name": "In Shop",  "value": in_shop_vehicles},
            {"name": "Retired",  "value": retired_vehicles},
        ],
        "trip_status": [
            {"name": "Planned",     "value": planned_trips},
            {"name": "In Progress", "value": active_trips},
            {"name": "Completed",   "value": completed_trips},
            {"name": "Cancelled",   "value": cancelled_trips},
        ],
        "expense_breakdown": expense_breakdown,
        "monthly_trip_trend": monthly_trend,
        "recent_activity": recent_activity,
    }
