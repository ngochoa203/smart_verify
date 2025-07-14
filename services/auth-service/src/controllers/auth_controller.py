from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from src.models import User, Seller, Admin
from src.schemas.auth_schemas import (
    UserCreate, UserUpdate, UserResponse,
    SellerCreate, SellerUpdate, SellerResponse,
    AdminCreate, AdminResponse,
    LoginRequest, LoginResponse,
    ForgotPasswordRequest, ResetPasswordRequest, PasswordResetResponse
)
from src.services.auth_service import AuthService
from src.services.email_service import EmailService
from src.config import settings

class AuthController:
    
    @staticmethod
    def register_user(user_data: UserCreate, db: Session) -> UserResponse:
        """Register a new user"""
        # Check if username already exists
        if AuthService.get_user_by_username(db, user_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email already exists
        if AuthService.get_user_by_email(db, user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        user = AuthService.create_user(db, user_data)
        
        # Send welcome email
        EmailService.send_welcome_email(user.email, user.username, "user")
        
        return UserResponse.from_orm(user)
    
    @staticmethod
    def register_seller(seller_data: SellerCreate, db: Session) -> SellerResponse:
        """Register a new seller"""
        # Check if username already exists
        if AuthService.get_seller_by_username(db, seller_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email already exists
        if AuthService.get_seller_by_email(db, seller_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create seller
        seller = AuthService.create_seller(db, seller_data)
        
        # Send welcome email
        EmailService.send_welcome_email(seller.email, seller.username, "seller")
        
        return SellerResponse.from_orm(seller)
    
    @staticmethod
    def login(login_data: LoginRequest, db: Session) -> LoginResponse:
        """Authenticate user/seller/admin and return JWT token"""
        user, user_type = AuthService.authenticate_user(db, login_data.username, login_data.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token = AuthService.create_access_token(
            data={
                "sub": user.username,
                "user_id": user.id,
                "user_type": user_type
            }
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.JWT_EXPIRATION_HOURS * 3600,  # Convert to seconds
            user_id=user.id,
            user_type=user_type
        )
    
    @staticmethod
    def forgot_password(request: ForgotPasswordRequest, db: Session) -> PasswordResetResponse:
        """Initiate password reset process"""
        # Check which type of user has this email
        user = AuthService.get_user_by_email(db, request.email)
        seller = AuthService.get_seller_by_email(db, request.email)
        
        user_type = None
        if user:
            user_type = "user"
        elif seller:
            user_type = "seller"
        else:
            # Don't reveal if email exists or not for security
            return PasswordResetResponse(message="If the email exists, a reset link will be sent")
        
        # Create password reset request
        reset_request = AuthService.create_password_reset(db, request.email, user_type)
        
        # Send reset email
        EmailService.send_password_reset_email(request.email, reset_request.token)
        
        return PasswordResetResponse(message="If the email exists, a reset link will be sent")
    
    @staticmethod
    def reset_password(request: ResetPasswordRequest, db: Session) -> PasswordResetResponse:
        """Reset password using token"""
        success = AuthService.reset_password(db, request.token, request.new_password)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        return PasswordResetResponse(message="Password has been reset successfully")
    
    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[UserResponse]:
        """Get all users (admin only)"""
        users = db.query(User).offset(skip).limit(limit).all()
        return [UserResponse.from_orm(user) for user in users]
    
    @staticmethod
    def get_user_by_id(user_id: int, db: Session) -> UserResponse:
        """Get user by ID"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserResponse.from_orm(user)
    
    @staticmethod
    def update_user(user_id: int, user_update: UserUpdate, db: Session) -> UserResponse:
        """Update user information"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update fields
        for field, value in user_update.dict(exclude_unset=True).items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        return UserResponse.from_orm(user)
    
    @staticmethod
    def delete_user(user_id: int, db: Session) -> dict:
        """Delete user"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        db.delete(user)
        db.commit()
        return {"message": "User deleted successfully"}
    
    @staticmethod
    def get_sellers(db: Session, skip: int = 0, limit: int = 100) -> List[SellerResponse]:
        """Get all sellers"""
        sellers = db.query(Seller).offset(skip).limit(limit).all()
        return [SellerResponse.from_orm(seller) for seller in sellers]
    
    @staticmethod
    def verify_seller(seller_id: int, db: Session) -> SellerResponse:
        """Verify seller (admin only)"""
        seller = db.query(Seller).filter(Seller.id == seller_id).first()
        if not seller:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Seller not found"
            )
        
        seller.is_verified = True
        db.commit()
        db.refresh(seller)
        
        # Send verification success email
        EmailService.send_email(
            [seller.email],
            "Seller Account Verified - Smart Verify",
            f"Hello {seller.username},\n\nYour seller account has been verified! You can now start selling on Smart Verify.\n\nBest regards,\nSmart Verify Team"
        )
        
        return SellerResponse.from_orm(seller)
    
    @staticmethod
    def create_admin(admin_data: AdminCreate, db: Session) -> AdminResponse:
        """Create admin (super admin only)"""
        # Check if username already exists
        if AuthService.get_admin_by_username(db, admin_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        admin = AuthService.create_admin(db, admin_data)
        return AdminResponse.from_orm(admin)
