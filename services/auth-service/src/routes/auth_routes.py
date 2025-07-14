from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List

from src.database import get_db
from src.controllers.auth_controller import AuthController
from src.services.auth_service import AuthService
from src.schemas.auth_schemas import (
    UserCreate, UserUpdate, UserResponse,
    SellerCreate, SellerUpdate, SellerResponse,
    AdminCreate, AdminResponse,
    LoginRequest, LoginResponse,
    ForgotPasswordRequest, ResetPasswordRequest, PasswordResetResponse,
    MessageResponse
)

router = APIRouter()
security = HTTPBearer()

# Dependency to get current user from JWT token
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user"""
    token = credentials.credentials
    payload = AuthService.verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username = payload.get("sub")
    user_type = payload.get("user_type")
    
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user based on type
    if user_type == "user":
        user = AuthService.get_user_by_username(db, username)
    elif user_type == "seller":
        user = AuthService.get_seller_by_username(db, username)
    elif user_type == "admin":
        user = AuthService.get_admin_by_username(db, username)
    else:
        user = None
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {"user": user, "user_type": user_type}

# Dependency to check admin privileges
async def get_current_admin(current_user_data = Depends(get_current_user)):
    """Ensure current user is admin"""
    if current_user_data["user_type"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user_data["user"]

# Health check
@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "auth-service"}

# Authentication endpoints
@router.post("/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    return AuthController.register_user(user_data, db)

@router.post("/sellers/register", response_model=SellerResponse)
async def register_seller(seller_data: SellerCreate, db: Session = Depends(get_db)):
    """Register a new seller"""
    return AuthController.register_seller(seller_data, db)

@router.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token"""
    return AuthController.login(login_data, db)

@router.post("/auth/forgot-password", response_model=PasswordResetResponse)
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request password reset"""
    return AuthController.forgot_password(request, db)

@router.post("/auth/reset-password", response_model=PasswordResetResponse)
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using token"""
    return AuthController.reset_password(request, db)

# User management endpoints
@router.get("/users", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """Get all users (admin only)"""
    return AuthController.get_users(db, skip, limit)

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user)
):
    """Get user by ID"""
    # Users can only access their own data, admins can access any user
    if (current_user_data["user_type"] != "admin" and 
        current_user_data["user"].id != user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user"
        )
    
    return AuthController.get_user_by_id(user_id, db)

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user_data = Depends(get_current_user)
):
    """Update user information"""
    # Users can only update their own data, admins can update any user
    if (current_user_data["user_type"] != "admin" and 
        current_user_data["user"].id != user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )
    
    return AuthController.update_user(user_id, user_update, db)

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """Delete user (admin only)"""
    return AuthController.delete_user(user_id, db)

# Seller management endpoints
@router.get("/sellers", response_model=List[SellerResponse])
async def get_sellers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all sellers"""
    return AuthController.get_sellers(db, skip, limit)

@router.put("/sellers/{seller_id}/verify", response_model=SellerResponse)
async def verify_seller(
    seller_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """Verify seller (admin only)"""
    return AuthController.verify_seller(seller_id, db)

# Admin management endpoints
@router.post("/admins", response_model=AdminResponse)
async def create_admin(
    admin_data: AdminCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """Create admin (admin only)"""
    return AuthController.create_admin(admin_data, db)

# Profile endpoints
@router.get("/profile")
async def get_profile(current_user_data = Depends(get_current_user)):
    """Get current user profile"""
    user = current_user_data["user"]
    user_type = current_user_data["user_type"]
    
    if user_type == "user":
        return UserResponse.from_orm(user)
    elif user_type == "seller":
        return SellerResponse.from_orm(user)
    elif user_type == "admin":
        return AdminResponse.from_orm(user)
