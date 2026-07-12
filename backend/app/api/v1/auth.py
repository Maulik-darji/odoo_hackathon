from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user import UserCreate, UserResponse, Token
from app.services.auth_service import authenticate_user, create_user, get_user_by_email
from app.core.security import create_access_token, create_refresh_token, get_password_hash
from app.core.config import settings
from jose import jwt, JWTError

from app.api.deps import get_current_user

import random
from pydantic import BaseModel, EmailStr

router = APIRouter()

# In-memory OTP store
otp_store = {}

class SendOTPRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

from app.core.email import send_verification_email

@router.post("/send-otp")
async def send_otp(request_in: SendOTPRequest):
    otp = f"{random.randint(100000, 999999)}"
    otp_store[request_in.email] = otp
    print("\n" + "="*50)
    print(f"OTP FOR {request_in.email}: {otp}")
    print("="*50 + "\n")
    
    # Send actual email using the async mailer helper
    await send_verification_email(request_in.email, otp)
    
    return {"message": "OTP sent successfully", "otp": otp}

@router.post("/verify-otp")
def verify_otp(request_in: VerifyOTPRequest):
    saved_otp = otp_store.get(request_in.email)
    if not saved_otp or saved_otp != request_in.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    return {"message": "OTP verified successfully"}

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user_in.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    return create_user(db=db, user_in=user_in)

from datetime import datetime, timezone

# email -> {count: int, lock_until: datetime, consecutive_lockouts: int}
login_attempts = {}

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email = form_data.username.lower().strip()
    now = datetime.now(timezone.utc)
    
    # Check if locked out
    attempt_info = login_attempts.get(email)
    if attempt_info and attempt_info["lock_until"] and now < attempt_info["lock_until"]:
        seconds_left = int((attempt_info["lock_until"] - now).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"LOCKED_OUT:{attempt_info['lock_until'].isoformat()}"
        )

    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        if not attempt_info:
            attempt_info = {"count": 0, "lock_until": None, "consecutive_lockouts": 0}
            login_attempts[email] = attempt_info
            
        attempt_info["count"] += 1
        
        if attempt_info["count"] >= 5:
            attempt_info["consecutive_lockouts"] += 1
            if attempt_info["consecutive_lockouts"] == 1:
                lock_duration = timedelta(minutes=1)
            elif attempt_info["consecutive_lockouts"] == 2:
                lock_duration = timedelta(minutes=5)
            else:
                lock_duration = timedelta(minutes=10)
                
            attempt_info["lock_until"] = now + lock_duration
            attempt_info["count"] = 0
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"LOCKED_OUT:{attempt_info['lock_until'].isoformat()}"
            )
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Incorrect email or password. Attempt {attempt_info['count']}/5.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Reset lock state on success
    login_attempts[email] = {"count": 0, "lock_until": None, "consecutive_lockouts": 0}
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(subject=user.email, expires_delta=access_token_expires)
    refresh_token = create_refresh_token(subject=user.email)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
def refresh_token(token_in: dict, db: Session = Depends(get_db)):
    refresh_token_val = token_in.get("refresh_token")
    if not refresh_token_val:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Refresh token required")
    
    try:
        payload = jwt.decode(refresh_token_val, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        if email is None or token_type != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        
    user = get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(subject=user.email, expires_delta=access_token_expires)
    new_refresh_token = create_refresh_token(subject=user.email)
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

@router.put("/tour", response_model=UserResponse)
def complete_tour(db: Session = Depends(get_db), current_user: UserResponse = Depends(get_current_user)):
    user = get_user_by_email(db, current_user.email)
    if user:
        user.tour_completed = True
        db.commit()
        db.refresh(user)
    return user


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str


@router.post("/forgot-password")
async def forgot_password(request_in: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=request_in.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account associated with this email address"
        )
    otp = f"{random.randint(100000, 999999)}"
    otp_store[request_in.email] = otp
    
    print("\n" + "="*50)
    print(f"RESET OTP FOR {request_in.email}: {otp}")
    print("="*50 + "\n")
    
    await send_verification_email(request_in.email, otp)
    return {"message": "Reset verification code sent successfully"}


@router.post("/reset-password")
def reset_password(request_in: ResetPasswordRequest, db: Session = Depends(get_db)):
    saved_otp = otp_store.get(request_in.email)
    if not saved_otp or saved_otp != request_in.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
        
    user = get_user_by_email(db, email=request_in.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    user.password_hash = get_password_hash(request_in.new_password)
    db.commit()
    
    # Remove OTP once verified and used
    otp_store.pop(request_in.email, None)
    
    return {"message": "Password reset successful"}
