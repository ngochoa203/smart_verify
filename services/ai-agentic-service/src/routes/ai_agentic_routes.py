from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from src.database import get_db
from src.mindsdb_service import mindsdb_service
from src.models import AIRiskScore, ProductAuthenticityData, SentimentAnalysis

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-agentic-service"}

@router.get("/risk-scores/{product_id}")
async def get_risk_score(product_id: int, db: Session = Depends(get_db)):
    """Get risk score for a product"""
    # Check if we already have a risk score
    risk_score = db.query(AIRiskScore).filter(
        AIRiskScore.product_id == product_id
    ).order_by(AIRiskScore.prediction_date.desc()).first()
    
    if risk_score:
        return {
            "product_id": product_id,
            "risk_score": risk_score.risk_score,
            "confidence": risk_score.confidence,
            "prediction_date": risk_score.prediction_date
        }
    
    # If not, generate a new prediction
    score = await mindsdb_service.predict_risk_score(product_id, db)
    
    return {
        "product_id": product_id,
        "risk_score": score,
        "confidence": 0.8,  # Default confidence
        "prediction_date": "now"
    }

@router.post("/predict/authenticity")
async def predict_authenticity(product_data: dict, db: Session = Depends(get_db)):
    """Predict if a product is authentic based on provided data"""
    # In a real implementation, we would use the product_data to make a prediction
    # For now, we'll return a mock response
    return {
        "is_authentic": product_data.get("price", 0) > 1000000,
        "confidence": 0.85,
        "risk_factors": ["price_too_low", "no_qr_code"] if product_data.get("price", 0) <= 1000000 else []
    }

@router.post("/analyze/sentiment")
async def analyze_sentiment(comment_data: dict, db: Session = Depends(get_db)):
    """Analyze sentiment of a product comment"""
    content = comment_data.get("content", "")
    # Simple mock sentiment analysis
    positive_words = ["good", "great", "excellent", "amazing", "love", "like"]
    negative_words = ["bad", "poor", "terrible", "hate", "dislike"]
    
    content_lower = content.lower()
    positive_count = sum(1 for word in positive_words if word in content_lower)
    negative_count = sum(1 for word in negative_words if word in content_lower)
    
    if positive_count > negative_count:
        sentiment = "positive"
        score = 0.7 + (positive_count - negative_count) * 0.1
    elif negative_count > positive_count:
        sentiment = "negative"
        score = 0.3 - (negative_count - positive_count) * 0.1
    else:
        sentiment = "neutral"
        score = 0.5
    
    # Ensure score is between 0 and 1
    score = max(0.1, min(0.9, score))
    
    return {
        "content": content,
        "sentiment": sentiment,
        "sentiment_score": score,
        "confidence": 0.8
    }
