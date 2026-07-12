from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timezone
import csv
import io
from app.db.database import get_db
from app.models.vehicle import Vehicle, VehicleStatusEnum
from app.models.driver import Driver, DriverStatusEnum
from app.models.trip import Trip, TripStatusEnum
from app.models.expense import Expense, ExpenseTypeEnum
from app.models.maintenance import Maintenance
from app.api.deps import get_current_user
from app.models.user import User
from typing import Optional

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    vehicle_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    region: Optional[str] = None
):
    # Apply filters to base Vehicle queries
    vehicle_query = db.query(Vehicle)
    if vehicle_type:
        vehicle_query = vehicle_query.filter(Vehicle.vehicle_type == vehicle_type)
    if status_filter:
        vehicle_query = vehicle_query.filter(Vehicle.status == status_filter)
    if region:
        vehicle_query = vehicle_query.filter(Vehicle.region == region)

    # --- Vehicles ---
    total_vehicles     = vehicle_query.count()
    available_vehicles = vehicle_query.filter(Vehicle.status == VehicleStatusEnum.AVAILABLE).count()
    on_trip_vehicles   = vehicle_query.filter(Vehicle.status == VehicleStatusEnum.ON_TRIP).count()
    in_shop_vehicles   = vehicle_query.filter(Vehicle.status == VehicleStatusEnum.IN_SHOP).count()
    retired_vehicles   = vehicle_query.filter(Vehicle.status == VehicleStatusEnum.RETIRED).count()

    # --- Drivers ---
    total_drivers     = db.query(Driver).count()
    available_drivers = db.query(Driver).filter(Driver.status == DriverStatusEnum.AVAILABLE).count()
    on_duty_drivers   = db.query(Driver).filter(Driver.status == DriverStatusEnum.ON_TRIP).count()

    # --- Trips ---
    total_trips     = db.query(Trip).count()
    draft_trips     = db.query(Trip).filter(Trip.status == TripStatusEnum.DRAFT).count()
    dispatched_trips = db.query(Trip).filter(Trip.status == TripStatusEnum.DISPATCHED).count()
    completed_trips = db.query(Trip).filter(Trip.status == TripStatusEnum.COMPLETED).count()
    cancelled_trips = db.query(Trip).filter(Trip.status == TripStatusEnum.CANCELLED).count()

    # --- Costs ---
    maintenance_cost = db.query(func.sum(Maintenance.cost)).scalar() or 0.0
    fuel_cost        = db.query(func.sum(Expense.amount)).filter(Expense.type == ExpenseTypeEnum.FUEL).scalar() or 0.0
    other_expenses   = db.query(func.sum(Expense.amount)).scalar() or 0.0
    total_cost       = maintenance_cost + other_expenses

    # --- Vehicle ROI Calculation ---
    vehicle_roi_list = []
    for v in vehicle_query.all():
        # Get trip revenue
        v_revenue = db.query(func.sum(Trip.revenue)).filter(Trip.vehicle_id == v.id, Trip.status == TripStatusEnum.COMPLETED).scalar() or 0.0
        if v_revenue == 0.0:
            total_dist = db.query(func.sum(Trip.planned_distance)).filter(Trip.vehicle_id == v.id, Trip.status == TripStatusEnum.COMPLETED).scalar() or 0.0
            v_revenue = total_dist * 2.5 # $2.5 per km estimate
            
        v_maintenance = db.query(func.sum(Maintenance.cost)).filter(Maintenance.vehicle_id == v.id).scalar() or 0.0
        v_fuel = db.query(func.sum(Expense.amount)).filter(Expense.vehicle_id == v.id, Expense.type == ExpenseTypeEnum.FUEL).scalar() or 0.0
        
        acq_cost = v.acquisition_cost if v.acquisition_cost and v.acquisition_cost > 0 else 40000.0
        roi = (v_revenue - (v_maintenance + v_fuel)) / acq_cost
        vehicle_roi_list.append({
            "id": v.id,
            "registration": v.registration_number,
            "make": v.make,
            "model": v.model,
            "roi": f"{round(roi * 100, 1)}%",
            "roi_numeric": roi
        })
    vehicle_roi_list = sorted(vehicle_roi_list, key=lambda x: x["roi_numeric"], reverse=True)[:5]

    # --- Fuel efficiency ---
    total_liters   = db.query(func.sum(Expense.liters)).filter(Expense.type == ExpenseTypeEnum.FUEL).scalar() or 0.0
    total_distance = db.query(func.sum(Trip.planned_distance)).filter(Trip.status == TripStatusEnum.COMPLETED).scalar() or 0.0
    fuel_efficiency = round(total_distance / total_liters, 2) if total_liters > 0 else 0.0

    # --- Expense breakdown by type ---
    expense_breakdown = []
    for exp_type in ExpenseTypeEnum:
        total = db.query(func.sum(Expense.amount)).filter(Expense.type == exp_type).scalar() or 0.0
        expense_breakdown.append({"name": exp_type.value, "value": round(total, 2)})
    # Add maintenance to breakdown
    expense_breakdown.append({"name": "Maintenance (Records)", "value": round(maintenance_cost, 2)})

    # --- Fleet utilization ---
    fleet_utilization = int((on_trip_vehicles + available_vehicles) / total_vehicles * 100) if total_vehicles > 0 else 0

    # --- Monthly trip trend (last 6 months of completed trips) ---
    now = datetime.now(timezone.utc)
    monthly_trend = []
    for i in range(5, -1, -1):
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
            "source": t.source,
            "destination": t.destination,
            "route": t.route_details or f"{t.source} → {t.destination}",
            "cargo_weight": t.cargo_weight,
            "planned_distance": t.planned_distance,
            "start_time": t.start_time.isoformat() if t.start_time else None,
            "vehicle_id": t.vehicle_id,
            "driver_id": t.driver_id,
        }
        for t in recent_trips_raw
    ]

    return {
        "kpis": {
            "fleet_utilization": f"{fleet_utilization}%",
            "total_fleet_size": total_vehicles,
            "available_vehicles": available_vehicles,
            "on_trip_vehicles": on_trip_vehicles,
            "in_shop": in_shop_vehicles,
            "total_drivers": total_drivers,
            "available_drivers": available_drivers,
            "drivers_on_duty": on_duty_drivers,
            "active_trips": dispatched_trips,
            "pending_trips": draft_trips,
            "total_trips": total_trips,
            "completed_trips": completed_trips,
            "operational_cost": f"${total_cost:,.2f}",
            "fuel_cost": f"${fuel_cost:,.2f}",
            "fuel_efficiency": f"{fuel_efficiency} km/L",
        },
        "fleet_status": [
            {"name": "Available", "value": available_vehicles},
            {"name": "On Trip",   "value": on_trip_vehicles},
            {"name": "In Shop",   "value": in_shop_vehicles},
            {"name": "Retired",   "value": retired_vehicles},
        ],
        "trip_status": [
            {"name": "Draft",      "value": draft_trips},
            {"name": "Dispatched", "value": dispatched_trips},
            {"name": "Completed",  "value": completed_trips},
            {"name": "Cancelled",  "value": cancelled_trips},
        ],
        "expense_breakdown": expense_breakdown,
        "monthly_trip_trend": monthly_trend,
        "recent_activity": recent_activity,
        "vehicle_roi": vehicle_roi_list,
    }


@router.get("/export/csv")
def export_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export a CSV report of all trips, vehicles, and expenses."""
    output = io.StringIO()
    writer = csv.writer(output)

    # --- Trips sheet ---
    writer.writerow(["=== TRIPS ==="])
    writer.writerow(["ID", "Source", "Destination", "Vehicle ID", "Driver ID", "Cargo Weight (kg)", "Planned Distance (km)", "Status", "Start Time", "End Time"])
    trips = db.query(Trip).all()
    for t in trips:
        writer.writerow([t.id, t.source, t.destination, t.vehicle_id, t.driver_id, t.cargo_weight, t.planned_distance, t.status.value, t.start_time, t.end_time])

    writer.writerow([])

    # --- Vehicles sheet ---
    writer.writerow(["=== VEHICLES ==="])
    writer.writerow(["ID", "Registration", "Make", "Model", "Type", "Capacity (kg)", "Odometer", "Acquisition Cost", "Status"])
    vehicles = db.query(Vehicle).all()
    for v in vehicles:
        writer.writerow([v.id, v.registration_number, v.make, v.model, v.vehicle_type.value if v.vehicle_type else "", v.capacity, v.odometer, v.acquisition_cost, v.status.value])

    writer.writerow([])

    # --- Drivers sheet ---
    writer.writerow(["=== DRIVERS ==="])
    writer.writerow(["ID", "Name", "License Number", "Category", "License Expiry", "Contact", "Safety Score", "Status"])
    drivers = db.query(Driver).all()
    for d in drivers:
        writer.writerow([d.id, d.name, d.license_number, d.license_category or "", d.license_expiry, d.contact_number or "", d.safety_score, d.status.value])

    writer.writerow([])

    # --- Expenses sheet ---
    writer.writerow(["=== EXPENSES ==="])
    writer.writerow(["ID", "Type", "Amount", "Liters", "Date", "Vehicle ID", "Trip ID", "Description"])
    expenses = db.query(Expense).all()
    for e in expenses:
        writer.writerow([e.id, e.type.value, e.amount, e.liters or "", e.date, e.vehicle_id or "", e.trip_id or "", e.description or ""])

    writer.writerow([])

    # --- Maintenance sheet ---
    writer.writerow(["=== MAINTENANCE ==="])
    writer.writerow(["ID", "Vehicle ID", "Description", "Cost", "Start Date", "End Date", "Status"])
    maintenance = db.query(Maintenance).all()
    for m in maintenance:
        writer.writerow([m.id, m.vehicle_id, m.description, m.cost, m.start_date, m.end_date, m.status.value])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transitops_report.csv"}
    )
