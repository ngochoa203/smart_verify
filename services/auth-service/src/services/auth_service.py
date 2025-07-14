import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Union, Tuple
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt

from src.models import User, Seller, Admin, PasswordReset
from src.schemas.auth_schemas import UserCreate, SellerCreate, AdminCreate, LoginRequest
from src.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            return payload
        except JWTError:
            return None
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username"""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_seller_by_username(db: Session, username: str) -> Optional[Seller]:
        """Get seller by username"""
        return db.query(Seller).filter(Seller.username == username).first()
    
    @staticmethod
    def get_seller_by_email(db: Session, email: str) -> Optional[Seller]:
        """Get seller by email"""
        return db.query(Seller).filter(Seller.email == email).first()
    
    @staticmethod
    def get_admin_by_username(db: Session, username: str) -> Optional[Admin]:
        """Get admin by username"""
        return db.query(Admin).filter(Admin.username == username).first()
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """Create a new user"""
        hashed_password = AuthService.hash_password(user_data.password)
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            password=hashed_password,
            phone=user_data.phone,
            address=user_data.address
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def create_seller(db: Session, seller_data: SellerCreate) -> Seller:
        """Create a new seller"""
        hashed_password = AuthService.hash_password(seller_data.password)
        db_seller = Seller(
            username=seller_data.username,
            email=seller_data.email,
            password=hashed_password,
            phone=seller_data.phone,
            shop_name=seller_data.shop_name,
            shop_description=seller_data.shop_description
        )
        db.add(db_seller)
        db.commit()
        db.refresh(db_seller)
        return db_seller
    
    @staticmethod
    def create_admin(db: Session, admin_data: AdminCreate) -> Admin:
        """Create a new admin"""
        hashed_password = AuthService.hash_password(admin_data.password)
        db_admin = Admin(
            username=admin_data.username,
            password=hashed_password
        )
        db.add(db_admin)
        db.commit()
        db.refresh(db_admin)
        return db_admin
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Tuple[Optional[Union[User, Seller, Admin]], str]:
        """Authenticate user, seller, or admin"""
        # Try user first
        user = AuthService.get_user_by_username(db, username)
        if user and AuthService.verify_password(password, user.password):
            return user, "user"
        
        # Try seller
        seller = AuthService.get_seller_by_username(db, username)
        if seller and AuthService.verify_password(password, seller.password):
            return seller, "seller"
        
        # Try admin
        admin = AuthService.get_admin_by_username(db, username)
        if admin and AuthService.verify_password(password, admin.password):
            return admin, "admin"
        
        return None, ""
    
    @staticmethod
    def generate_reset_token() -> str:
        """Generate a secure reset token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def create_password_reset(db: Session, email: str, user_type: str) -> PasswordReset:
        """Create a password reset request"""
        token = AuthService.generate_reset_token()
        expires_at = datetime.utcnow() + timedelta(hours=settings.PASSWORD_RESET_EXPIRE_HOURS)
        
        reset_request = PasswordReset(
            email=email,
            token=token,
            user_type=user_type,
            expires_at=expires_at
        )
        
        db.add(reset_request)
        db.commit()
        db.refresh(reset_request)
        return reset_request
    
    @staticmethod
    def verify_reset_token(db: Session, token: str) -> Optional[PasswordReset]:
        """Verify password reset token"""
        reset_request = db.query(PasswordReset).filter(
            PasswordReset.token == token,
            PasswordReset.used == False,
            PasswordReset.expires_at > datetime.utcnow()
        ).first()
        
        return reset_request
    
    @staticmethod
    def reset_password(db: Session, token: str, new_password: str) -> bool:
        """Reset password using token"""
        reset_request = AuthService.verify_reset_token(db, token)
        if not reset_request:
            return False
        
        hashed_password = AuthService.hash_password(new_password)
        
        # Update password based on user type
        if reset_request.user_type == "user":
            user = AuthService.get_user_by_email(db, reset_request.email)
            if user:
                user.password = hashed_password
        elif reset_request.user_type == "seller":
            seller = AuthService.get_seller_by_email(db, reset_request.email)
            if seller:
                seller.password = hashed_password
        elif reset_request.user_type == "admin":
            # Admins don't have email, so this case might need special handling
            pass
        
        # Mark token as used
        reset_request.used = True
        
        db.commit()
        return True
