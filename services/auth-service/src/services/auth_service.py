from datetime import datetime, timedelta
from typing import Optional, Tuple, Any
import jwt
import uuid
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from ..models import User, Seller, Admin, PasswordReset
from ..schemas.auth_schemas import UserCreate, SellerCreate, AdminCreate
from ..config import get_jwt_config

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """Create a new user"""
        hashed_password = AuthService.get_password_hash(user_data.password)
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            password=hashed_password,
            phone=user_data.phone,
            address=user_data.address,
            avatar_url=user_data.avatar_url
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def create_seller(db: Session, seller_data: SellerCreate) -> Seller:
        """Create a new seller"""
        hashed_password = AuthService.get_password_hash(seller_data.password)
        db_seller = Seller(
            username=seller_data.username,
            email=seller_data.email,
            password=hashed_password,
            phone=seller_data.phone,
            shop_name=seller_data.shop_name,
            shop_description=seller_data.shop_description,
            logo_url=seller_data.logo_url
        )
        db.add(db_seller)
        db.commit()
        db.refresh(db_seller)
        return db_seller

    @staticmethod
    def create_admin(db: Session, admin_data: AdminCreate) -> Admin:
        """Create a new admin"""
        hashed_password = AuthService.get_password_hash(admin_data.password)
        db_admin = Admin(
            username=admin_data.username,
            password=hashed_password
        )
        db.add(db_admin)
        db.commit()
        db.refresh(db_admin)
        return db_admin

    @staticmethod
    def authenticate_user(db: Session, email_or_username: str, password: str) -> Tuple[Any, str]:
        """Authenticate a user, seller, or admin"""
        # Try to find user by email or username
        user = db.query(User).filter(
            (User.email == email_or_username) | (User.username == email_or_username)
        ).first()
        if user and AuthService.verify_password(password, getattr(user, "password", "")):
            return user, "user"

        # Try to find seller by email or username
        seller = db.query(Seller).filter(
            (Seller.email == email_or_username) | (Seller.username == email_or_username)
        ).first()
        if seller and AuthService.verify_password(password, getattr(seller, "password", "")):
            return seller, "seller"

        # Try to find admin by username only
        admin = db.query(Admin).filter(Admin.username == email_or_username).first()
        if admin and AuthService.verify_password(password, getattr(admin, "password", "")):
            return admin, "admin"

        return None, ""

    @staticmethod
    def create_access_token(data: dict) -> str:
        """Create JWT access token"""
        jwt_config = get_jwt_config()
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=jwt_config["access_token_expire_minutes"])
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, 
            jwt_config["secret_key"], 
            algorithm=jwt_config["algorithm"]
        )
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """Verify JWT token"""
        jwt_config = get_jwt_config()
        try:
            payload = jwt.decode(
                token, 
                jwt_config["secret_key"], 
                algorithms=[jwt_config["algorithm"]]
            )
            return payload
        except jwt.PyJWTError:
            return None

    @staticmethod
    def create_password_reset(db: Session, email: str, user_type: str) -> PasswordReset:
        """Create password reset token"""
        # Generate unique token
        token = str(uuid.uuid4())
        
        # Set expiration (24 hours)
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        # Create reset record
        reset = PasswordReset(
            email=email,
            token=token,
            user_type=user_type,
            expires_at=expires_at
        )
        
        db.add(reset)
        db.commit()
        db.refresh(reset)
        
        return reset

    @staticmethod
    def reset_password(db: Session, token: str, new_password: str) -> bool:
        """Reset password using token"""
        # Find valid token
        reset = db.query(PasswordReset).filter(
            PasswordReset.token == token,
            PasswordReset.used.is_(False),
            PasswordReset.expires_at > datetime.utcnow()
        ).first()
        
        if not reset:
            return False
        
        # Hash new password
        hashed_password = AuthService.get_password_hash(new_password)
        
        # Update password based on user type
        if getattr(reset, "user_type", None) == "user":
            user = db.query(User).filter(User.email == reset.email).first()
            if user is not None:
                setattr(user, "password", hashed_password)
        elif getattr(reset, "user_type", None) == "seller":
            seller = db.query(Seller).filter(Seller.email == reset.email).first()
            if seller is not None:
                setattr(seller, "password", hashed_password)
        elif getattr(reset, "user_type", None) == "admin":
            admin = db.query(Admin).filter(Admin.username == reset.email).first()
            if admin is not None:
                setattr(admin, "password", hashed_password)
        else:
            return False

        # Mark token as used
        setattr(reset, "used", True)
        
        db.commit()
        return True

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username"""
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_seller_by_username(db: Session, username: str) -> Optional[Seller]:
        """Get seller by username"""
        return db.query(Seller).filter(Seller.username == username).first()

    @staticmethod
    def get_admin_by_username(db: Session, username: str) -> Optional[Admin]:
        """Get admin by username"""
        return db.query(Admin).filter(Admin.username == username).first()