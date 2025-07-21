from sqlalchemy import Column, Integer, DateTime, UniqueConstraint, CheckConstraint
from sqlalchemy.sql import func
from src.database import Base

class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', 'variant_id', name='uix_user_product_variant'),
        CheckConstraint('quantity > 0', name='check_positive_quantity'),
        {'schema': 'cart_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)  # Reference to auth-service
    product_id = Column(Integer, nullable=False, index=True)  # Reference to product-service
    variant_id = Column(Integer, nullable=True)  # Reference to product-service
    quantity = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, server_default=func.current_timestamp())
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())