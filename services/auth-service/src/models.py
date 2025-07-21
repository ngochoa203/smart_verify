from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'schema': 'auth_service'}
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String(15))
    address = Column(String)
    avatar_url = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

class Seller(Base):
    __tablename__ = "sellers"
    __table_args__ = {'schema': 'auth_service'}
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String(15))
    shop_name = Column(String(100), nullable=False)
    shop_description = Column(String)
    logo_url = Column(String)
    is_verified = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)


class Admin(Base):
    __tablename__ = "admins"
    __table_args__ = {'schema': 'auth_service'}
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

# Password reset model for TMDT
from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.orm import relationship

class PasswordReset(Base):
    __tablename__ = "password_resets"
    __table_args__ = {'schema': 'auth_service'}
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False, index=True)
    token = Column(String(128), unique=True, nullable=False, index=True)
    user_type = Column(String(20), nullable=False)  # user | seller | admin
    used = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
