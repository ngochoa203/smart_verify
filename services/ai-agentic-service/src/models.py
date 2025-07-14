from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean
from sqlalchemy.sql import func
from src.database import Base

class AIRiskScore(Base):
    __tablename__ = "ai_risk_scores"
    __table_args__ = (
        {'schema': 'ai_agentic_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, nullable=False, index=True)  # Reference to product-service
    risk_score = Column(Float, nullable=False)  # 0.0 to 1.0
    confidence = Column(Float, nullable=False)  # 0.0 to 1.0
    features_used = Column(Text, nullable=True)  # JSON string of features used
    model_version = Column(String(50), nullable=False)
    prediction_date = Column(DateTime, server_default=func.current_timestamp())
    created_at = Column(DateTime, server_default=func.current_timestamp())

class SentimentAnalysis(Base):
    __tablename__ = "sentiment_analysis"
    __table_args__ = (
        {'schema': 'ai_agentic_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, nullable=False, index=True)  # Reference to review-service
    content = Column(Text, nullable=False)
    sentiment_score = Column(Float, nullable=False)  # -1.0 to 1.0
    sentiment_label = Column(String(20), nullable=False)  # 'positive', 'negative', 'neutral'
    confidence = Column(Float, nullable=False)
    model_used = Column(String(50), nullable=False)
    created_at = Column(DateTime, server_default=func.current_timestamp())

class ProductAuthenticityData(Base):
    """
    Table to aggregate data from multiple services for MindsDB training
    Based on the original schema structure
    """
    __tablename__ = "product_authenticity_data"
    __table_args__ = (
        {'schema': 'ai_agentic_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, nullable=False, index=True)
    
    # Product features (from product-service)
    seller_id = Column(Integer)
    user_id = Column(Integer)
    brand = Column(Text)
    price = Column(Integer)
    category_id = Column(Integer)
    
    # QR/Blockchain features (from inventory-service)
    has_qr_code = Column(Boolean, default=False)
    qr_scan_count = Column(Integer, default=0)
    blockchain_verified = Column(Boolean, default=False)
    
    # Comment/Review features (aggregated from review-service)
    comment_count = Column(Integer, default=0)
    avg_sentiment = Column(Float, default=0.0)
    
    # Target variable for training
    is_authentic = Column(Boolean, nullable=True)  # To be labeled manually or from validation
    risk_level = Column(String(20), nullable=True)  # 'low', 'medium', 'high'
    
    last_updated = Column(DateTime, server_default=func.current_timestamp())
    created_at = Column(DateTime, server_default=func.current_timestamp())

class MindsDBModel(Base):
    __tablename__ = "mindsdb_models"
    __table_args__ = (
        {'schema': 'ai_agentic_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), unique=True, nullable=False)
    model_type = Column(String(50), nullable=False)  # 'sentiment', 'authenticity', 'risk'
    model_status = Column(String(50), nullable=False)  # training, complete, error
    accuracy = Column(Float, nullable=True)
    training_data_count = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp())
    updated_at = Column(DateTime, server_default=func.current_timestamp())
