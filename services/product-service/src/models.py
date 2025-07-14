from sqlalchemy import Column, Integer, String, Text, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from src.database import Base

class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (
        {'schema': 'product_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    parent_id = Column(Integer, nullable=True)  # Self-reference without FK constraint

class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        {'schema': 'product_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, nullable=True, index=True)  # Reference to auth-service
    user_id = Column(Integer, nullable=True, index=True)    # Reference to auth-service  
    name = Column(Text, nullable=False, index=True)
    description = Column(Text)
    brand = Column(Text)
    category_id = Column(Integer, nullable=True, index=True)
    price = Column(Integer)
    created_at = Column(DateTime, server_default=func.current_timestamp())

class ProductVariant(Base):
    __tablename__ = "product_variants"
    __table_args__ = (
        UniqueConstraint('product_id', 'size', 'color', name='uix_product_size_color'),
        {'schema': 'product_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, nullable=False, index=True)
    size = Column(Text, nullable=False)
    color = Column(Text, nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Integer)
    created_at = Column(DateTime, server_default=func.current_timestamp())

class ProductImage(Base):
    __tablename__ = "product_images"
    __table_args__ = (
        UniqueConstraint('product_id', 'image_url', name='uix_product_image_url'),
        {'schema': 'product_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, nullable=False, index=True)
    image_url = Column(Text, nullable=False)
    uploaded_at = Column(DateTime, server_default=func.current_timestamp())
