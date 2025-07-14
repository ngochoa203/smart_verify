from sqlalchemy import Column, Integer, String, Text, DateTime, CheckConstraint
from sqlalchemy.sql import func
from src.database import Base

class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        CheckConstraint('status IN (0, 1, 2, 3)', name='check_order_status'),
        {'schema': 'order_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)  # Reference to auth-service
    total_amount = Column(Integer, nullable=False)
    status = Column(Integer, default=0)  # 0: pending, 1: shipped, 2: completed, 3: canceled
    blockchain_hash = Column(Text, unique=True, nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp())

class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = (
        CheckConstraint('quantity > 0', name='check_positive_quantity'),
        {'schema': 'order_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=False, index=True)
    product_id = Column(Integer, nullable=False, index=True)  # Reference to product-service
    variant_id = Column(Integer, nullable=True)  # Reference to product-service
    quantity = Column(Integer, nullable=False)
    price = Column(Integer, nullable=False)
    # Note: total_price will be calculated as GENERATED column in actual DB
    # For SQLAlchemy, we'll calculate in application logic
