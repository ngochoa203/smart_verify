from sqlalchemy import Column, Integer, Text, DateTime, Boolean, UniqueConstraint
from sqlalchemy.sql import func
from src.database import Base

class ProductUnit(Base):
    __tablename__ = "product_units"
    __table_args__ = (
        {'schema': 'inventory_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, nullable=False, index=True)  # Reference to product-service
    variant_id = Column(Integer, nullable=True)  # Reference to product-service
    qr_code = Column(Text, unique=True, nullable=False, index=True)
    blockchain_hash = Column(Text, unique=True, nullable=False, index=True)
    is_used = Column(Boolean, default=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp())

class OwnProduct(Base):
    __tablename__ = "own_products"
    __table_args__ = (
        UniqueConstraint('product_id', 'is_seller', 'owner_id', name='uix_product_owner'),
        {'schema': 'inventory_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, nullable=False, index=True)  # Reference to product-service
    is_seller = Column(Boolean, nullable=False, default=True)  # TRUE = seller, FALSE = user
    owner_id = Column(Integer, nullable=False)  # Reference to auth-service (user_id or seller_id)
    created_at = Column(DateTime, server_default=func.current_timestamp())
