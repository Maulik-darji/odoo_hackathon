from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.services import expense_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[ExpenseResponse])
def read_expenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return expense_service.get_expenses(db, skip=skip, limit=limit)

@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return expense_service.create_expense(db, expense_in)

@router.get("/{expense_id}", response_model=ExpenseResponse)
def read_expense(expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = expense_service.get_expense_by_id(db, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(expense_id: int, expense_in: ExpenseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return expense_service.update_expense(db, expense_id, expense_in)

@router.delete("/{expense_id}", response_model=ExpenseResponse)
def delete_expense(expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return expense_service.delete_expense(db, expense_id)
