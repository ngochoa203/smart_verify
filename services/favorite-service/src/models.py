from sqlalchemy import Column, Integer, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from src.database import Base

class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', name='uix_user_product_favorite'),
        {'schema': 'favorite_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)  # Reference to auth-service
    product_id = Column(Integer, nullable=False, index=True)  # Reference to product-service
    created_at = Column(DateTime, server_default=func.current_timestamp())
