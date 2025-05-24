from typing import Optional
from pydantic import BaseModel
from datetime import datetime
class User(BaseModel):
    username: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = True

class UserCreate(User):
    password_hash: str

class UserUpdate(User):
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None
    password_hash: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(User):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True