from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    # Returns all users for admin management
    return db.query(User).order_by(User.created_at.desc()).all()

@router.put("/{user_id}/approve", response_model=UserResponse)
def approve_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_approved = True
    db.commit()
    db.refresh(user)
    
    # Mock Email Sending
    print("\n" + "="*50)
    print(f"EMAIL SENT TO: {user.email}")
    print("SUBJECT: TransitOps Account Approved")
    print(f"Hi {user.name or 'User'},\n\nYour operational access as {user.role} has been approved by the Administrator.\nYou can now log in to the dashboard.\n\nBest,\nTransitOps Team")
    print("="*50 + "\n")
    
    return user

@router.put("/{user_id}/reject", response_model=UserResponse)
def reject_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_approved = False
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


from app.models.user import RoleEnum
from pydantic import BaseModel

class RoleRequest(BaseModel):
    requested_role: RoleEnum

@router.put("/request-role", response_model=UserResponse)
def request_role(
    role_in: RoleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.requested_role = role_in.requested_role
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/{user_id}/approve-role", response_model=UserResponse)
def approve_role(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.requested_role:
        raise HTTPException(status_code=400, detail="No role upgrade requested for this user")
        
    old_role = user.role
    user.role = user.requested_role
    user.requested_role = None
    db.commit()
    db.refresh(user)
    
    # Mock Email Sending
    print("\n" + "="*50)
    print(f"EMAIL SENT TO: {user.email}")
    print("SUBJECT: TransitOps Role Upgrade Approved")
    print(f"Hi {user.name or 'User'},\n\nYour request to change your role from {old_role} to {user.role} has been approved by the Administrator.\nPlease refresh your session to view your upgraded dashboard.\n\nBest,\nTransitOps Team")
    print("="*50 + "\n")
    
    return user
