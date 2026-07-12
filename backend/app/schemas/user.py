from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import RoleEnum

class UserBase(BaseModel):
    email: EmailStr
    role: RoleEnum
    name: str | None = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    tour_completed: bool
    is_approved: bool | None = False
    is_admin: bool | None = False
    requested_role: RoleEnum | None = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None
