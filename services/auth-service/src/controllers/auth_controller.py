
from fastapi import HTTPException
from ..schemas.auth_schemas import (
    UserCreate, UserUpdate, UserResponse,
    SellerCreate, SellerUpdate, SellerResponse,
    AdminCreate, AdminResponse,
    LoginRequest, LoginResponse,
    ForgotPasswordRequest, ResetPasswordRequest, PasswordResetResponse,
    MessageResponse
)
from ..models import User, Seller, Admin
from sqlalchemy.orm import Session
from ..services.auth_service import AuthService

def register_user(data: UserCreate, db: Session):
    # Use text() to explicitly specify the schema
    from sqlalchemy import text
    result = db.execute(text("SELECT * FROM auth_service.users WHERE email = :email"), {"email": data.email}).first()
    if result:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = AuthService.create_user(db, data)
    return UserResponse.from_orm(user)

def register_seller(data: SellerCreate, db: Session):
    if db.query(Seller).filter(Seller.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    seller = AuthService.create_seller(db, data)
    return SellerResponse.from_orm(seller)

def login(data: LoginRequest, db: Session):
    email = str(data.email) if data.email else (str(data.username) if data.username else "")
    user, user_type = AuthService.authenticate_user(db, email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Always check which table the user is in to set user_type correctly
    from src.models import User, Seller, Admin
    role = None
    if db.query(User).filter(User.email == email).first():
        role = "user"
    elif db.query(Seller).filter(Seller.email == email).first():
        role = "seller"
    elif db.query(Admin).filter(Admin.username == email).first():
        role = "admin"
    else:
        role = user_type
    token = AuthService.create_access_token({"sub": getattr(user, "username", None), "user_type": role})
    return LoginResponse(access_token=token, token_type="bearer")

def forgot_password(request: ForgotPasswordRequest, db: Session):
    # Kiểm tra email tồn tại
    if request.user_type == "user":
        user = db.query(User).filter(User.email == request.email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
    elif request.user_type == "seller":
        seller = db.query(Seller).filter(Seller.email == request.email).first()
        if not seller:
            raise HTTPException(status_code=404, detail="Seller not found")
    elif request.user_type == "admin":
        admin = db.query(Admin).filter(Admin.username == request.email).first()
        if not admin:
            raise HTTPException(status_code=404, detail="Admin not found")
    else:
        raise HTTPException(status_code=400, detail="Invalid user_type")
    reset = AuthService.create_password_reset(db, request.email, request.user_type)
    # TODO: Gửi email chứa token cho user
    return PasswordResetResponse(message="Password reset token created. Check your email.")

def reset_password(request: ResetPasswordRequest, db: Session):
    ok = AuthService.reset_password(db, request.token, request.new_password)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    return PasswordResetResponse(message="Password reset successful.")

# Bọc các hàm controller vào class AuthController để import đúng chuẩn
class AuthController:
    @staticmethod
    def register_user(data: UserCreate, db: Session):
        # Use text() to explicitly specify the schema
        from sqlalchemy import text
        result = db.execute(text("SELECT * FROM auth_service.users WHERE email = :email"), {"email": data.email}).first()
        if result:
            raise HTTPException(status_code=400, detail="Email already registered")
        user = AuthService.create_user(db, data)
        return UserResponse.from_orm(user)

    @staticmethod
    def register_seller(data: SellerCreate, db: Session):
        if db.query(Seller).filter(Seller.email == data.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        seller = AuthService.create_seller(db, data)
        return SellerResponse.from_orm(seller)

    @staticmethod
    def login(data: LoginRequest, db: Session):
        email = str(data.email) if data.email else (str(data.username) if data.username else "")
        user, user_type = AuthService.authenticate_user(db, email, data.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        # Lấy đúng role thực tế từ bảng
        role = None
        from src.models import User, Seller, Admin
        if db.query(User).filter(User.email == email).first():
            role = "user"
        elif db.query(Seller).filter(Seller.email == email).first():
            role = "seller"
        elif db.query(Admin).filter(Admin.username == email).first():
            role = "admin"
        else:
            role = user_type
        token = AuthService.create_access_token({"sub": getattr(user, "username", None), "user_type": role})
        return LoginResponse(access_token=token, token_type="bearer")

    @staticmethod
    def forgot_password(request: ForgotPasswordRequest, db: Session):
        # Kiểm tra email tồn tại
        if request.user_type == "user":
            user = db.query(User).filter(User.email == request.email).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
        elif request.user_type == "seller":
            seller = db.query(Seller).filter(Seller.email == request.email).first()
            if not seller:
                raise HTTPException(status_code=404, detail="Seller not found")
        elif request.user_type == "admin":
            admin = db.query(Admin).filter(Admin.username == request.email).first()
            if not admin:
                raise HTTPException(status_code=404, detail="Admin not found")
        else:
            raise HTTPException(status_code=400, detail="Invalid user_type")
        reset = AuthService.create_password_reset(db, request.email, request.user_type)
        # TODO: Gửi email chứa token cho user
        return PasswordResetResponse(message="Password reset token created. Check your email.")

    @staticmethod
    def reset_password(request: ResetPasswordRequest, db: Session):
        ok = AuthService.reset_password(db, request.token, request.new_password)
        if not ok:
            raise HTTPException(status_code=400, detail="Invalid or expired token")
        return PasswordResetResponse(message="Password reset successful.")

    # User management
    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100):
        users = db.query(User).offset(skip).limit(limit).all()
        return [UserResponse.from_orm(u) for u in users]

    @staticmethod
    def get_user_by_id(user_id: int, db: Session):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserResponse.from_orm(user)

    @staticmethod
    def update_user(user_id: int, user_update: UserUpdate, db: Session):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        for field, value in user_update.dict(exclude_unset=True).items():
            setattr(user, field, value)
        db.commit()
        db.refresh(user)
        return UserResponse.from_orm(user)

    @staticmethod
    def delete_user(user_id: int, db: Session):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        db.delete(user)
        db.commit()
        return MessageResponse(message="User deleted")

    # Seller management
    @staticmethod
    def get_sellers(db: Session, skip: int = 0, limit: int = 100):
        sellers = db.query(Seller).offset(skip).limit(limit).all()
        return [SellerResponse.from_orm(s) for s in sellers]

    @staticmethod
    def verify_seller(seller_id: int, db: Session):
        seller = db.query(Seller).filter(Seller.id == seller_id).first()
        if not seller:
            raise HTTPException(status_code=404, detail="Seller not found")
        setattr(seller, "is_verified", True)
        db.commit()
        db.refresh(seller)
        return SellerResponse.from_orm(seller)

    # Admin management
    @staticmethod
    def create_admin(admin_data: AdminCreate, db: Session):
        if db.query(Admin).filter(Admin.username == admin_data.username).first():
            raise HTTPException(status_code=400, detail="Admin username already exists")
        admin = AuthService.create_admin(db, admin_data)
        return AdminResponse.from_orm(admin)
