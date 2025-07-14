from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from src.database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        {'schema': 'auth_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(Text, nullable=False)
    phone = Column(String(15))
    address = Column(Text)
    avatar_url = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.current_timestamp())

class Seller(Base):
    __tablename__ = "sellers"
    __table_args__ = (
        {'schema': 'auth_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(Text, nullable=False)
    phone = Column(String(15))
    shop_name = Column(String(100), nullable=False)
    shop_description = Column(Text)
    logo_url = Column(Text)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.current_timestamp())

class Admin(Base):
    __tablename__ = "admins"
    __table_args__ = (
        {'schema': 'auth_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.current_timestamp())

class PasswordReset(Base):
    __tablename__ = "password_resets"
    __table_args__ = (
        {'schema': 'auth_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False, index=True)
    token = Column(String(255), nullable=False, unique=True, index=True)
    user_type = Column(String(20), nullable=False)  # 'user', 'seller', 'admin'
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.current_timestamp())
