from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate
from app.services.vehicle_service import get_vehicle_by_id

def get_expenses(db: Session, skip: int = 0, limit: int = 100) -> list[Expense]:
    return db.query(Expense).offset(skip).limit(limit).all()

def get_expense_by_id(db: Session, expense_id: int) -> Expense | None:
    return db.query(Expense).filter(Expense.id == expense_id).first()

def create_expense(db: Session, expense_in: ExpenseCreate) -> Expense:
    if expense_in.vehicle_id:
        vehicle = get_vehicle_by_id(db, expense_in.vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=400, detail="Vehicle not found.")
            
    db_expense = Expense(**expense_in.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def update_expense(db: Session, expense_id: int, expense_in: ExpenseUpdate) -> Expense:
    db_expense = get_expense_by_id(db, expense_id)
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found.")
    
    update_data = expense_in.model_dump(exclude_unset=True)
    
    if "vehicle_id" in update_data and update_data["vehicle_id"] != db_expense.vehicle_id:
        vehicle = get_vehicle_by_id(db, update_data["vehicle_id"])
        if not vehicle:
            raise HTTPException(status_code=400, detail="Vehicle not found.")
            
    for key, value in update_data.items():
        setattr(db_expense, key, value)
        
    db.commit()
    db.refresh(db_expense)
    return db_expense

def delete_expense(db: Session, expense_id: int) -> Expense:
    db_expense = get_expense_by_id(db, expense_id)
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found.")
    db.delete(db_expense)
    db.commit()
    return db_expense
