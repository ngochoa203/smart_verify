from sqlalchemy import Column, Integer, Text, DateTime
from sqlalchemy.sql import func
from src.database import Base

class Comment(Base):
    __tablename__ = "comments"
    __table_args__ = (
        {'schema': 'review_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)  # Reference to auth-service
    product_id = Column(Integer, nullable=False, index=True)  # Reference to product-service
    content = Column(Text, nullable=False)
    sentiment = Column(Integer, nullable=True)  # Sentiment analysis result from AI service
    created_at = Column(DateTime, server_default=func.current_timestamp())
