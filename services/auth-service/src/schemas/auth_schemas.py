from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Seller schemas
class SellerBase(BaseModel):
    username: str
    email: EmailStr
    phone: Optional[str] = None
    shop_name: str
    shop_description: Optional[str] = None
    logo_url: Optional[str] = None

class SellerCreate(SellerBase):
    password: str

class SellerUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    shop_name: Optional[str] = None
    shop_description: Optional[str] = None
    logo_url: Optional[str] = None
    is_verified: Optional[bool] = None

class SellerResponse(SellerBase):
    id: int
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Admin schemas
class AdminBase(BaseModel):
    username: str

class AdminCreate(AdminBase):
    password: str

class AdminResponse(AdminBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Authentication schemas
class LoginRequest(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    user_type: str = Field(..., description="Type of user: 'user', 'seller', or 'admin'")

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class PasswordResetResponse(BaseModel):
    message: str

class MessageResponse(BaseModel):
    message: str