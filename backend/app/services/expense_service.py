from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


def get_expenses(db: Session, skip: int = 0, limit: int = 100) -> list[Expense]:
    return db.query(Expense).offset(skip).limit(limit).all()


def get_expense_by_id(db: Session, expense_id: int) -> Expense | None:
    return db.query(Expense).filter(Expense.id == expense_id).first()


def _validate_fks(db: Session, vehicle_id: int | None, trip_id: int | None) -> None:
    """Ensure referenced vehicle / trip actually exist."""
    if vehicle_id is not None:
        if not db.query(Vehicle).filter(Vehicle.id == vehicle_id).first():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vehicle {vehicle_id} not found.",
            )
    if trip_id is not None:
        if not db.query(Trip).filter(Trip.id == trip_id).first():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip {trip_id} not found.",
            )


def create_expense(db: Session, expense_in: ExpenseCreate) -> Expense:
    _validate_fks(db, expense_in.vehicle_id, expense_in.trip_id)

    db_expense = Expense(**expense_in.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def update_expense(db: Session, expense_id: int, expense_in: ExpenseUpdate) -> Expense:
    db_expense = get_expense_by_id(db, expense_id)
    if not db_expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found.",
        )

    update_data = expense_in.model_dump(exclude_unset=True)

    _validate_fks(
        db,
        update_data.get("vehicle_id"),
        update_data.get("trip_id"),
    )

    for key, value in update_data.items():
        setattr(db_expense, key, value)

    db.commit()
    db.refresh(db_expense)
    return db_expense


def delete_expense(db: Session, expense_id: int) -> Expense:
    db_expense = get_expense_by_id(db, expense_id)
    if not db_expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found.",
        )

    db.delete(db_expense)
    db.commit()
    return db_expense
