from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import requests

from src.database import get_db
from src.models import Comment
from src.schemas.review_schemas import CommentCreate, CommentUpdate, CommentResponse
from src.config import settings

router = APIRouter()

# Health check
@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "review-service"}

# Comment endpoints
@router.post("/comments", response_model=CommentResponse)
async def create_comment(comment: CommentCreate, db: Session = Depends(get_db)):
    """Create a new comment/review"""
    # Create comment
    db_comment = Comment(
        user_id=comment.user_id,
        product_id=comment.product_id,
        content=comment.content
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # Request sentiment analysis from AI service (async)
    try:
        # This would be a non-blocking call in production
        response = requests.post(
            f"http://ai-agentic-service:8000/api/v1/analyze/sentiment",
            json={"content": comment.content, "comment_id": db_comment.id},
            timeout=1  # Short timeout to avoid blocking
        )
        
        if response.status_code == 200:
            sentiment_data = response.json()
            db_comment.sentiment = sentiment_data.get("sentiment_score", 0.5)
            db.commit()
            db.refresh(db_comment)
    except Exception as e:
        # Log error but don't fail the request
        print(f"Error requesting sentiment analysis: {e}")
    
    return db_comment

@router.get("/comments", response_model=List[CommentResponse])
async def get_comments(
    product_id: Optional[int] = None,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all comments with optional filters"""
    query = db.query(Comment)
    
    # Apply filters
    if product_id:
        query = query.filter(Comment.product_id == product_id)
    if user_id:
        query = query.filter(Comment.user_id == user_id)
    
    comments = query.order_by(Comment.created_at.desc()).offset(skip).limit(limit).all()
    return comments

@router.get("/comments/{comment_id}", response_model=CommentResponse)
async def get_comment(comment_id: int, db: Session = Depends(get_db)):
    """Get comment by ID"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment

@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    db: Session = Depends(get_db)
):
    """Update comment"""
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Update fields
    if comment_update.content is not None:
        db_comment.content = comment_update.content
        
        # Request updated sentiment analysis
        try:
            response = requests.post(
                f"http://ai-agentic-service:8000/api/v1/analyze/sentiment",
                json={"content": db_comment.content, "comment_id": db_comment.id},
                timeout=1
            )
            
            if response.status_code == 200:
                sentiment_data = response.json()
                db_comment.sentiment = sentiment_data.get("sentiment_score", 0.5)
        except Exception as e:
            print(f"Error requesting sentiment analysis: {e}")
    
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    """Delete comment"""
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    db.delete(db_comment)
    db.commit()
    return {"message": "Comment deleted successfully"}

# Product rating endpoints
@router.get("/products/{product_id}/rating")
async def get_product_rating(product_id: int, db: Session = Depends(get_db)):
    """Get average sentiment rating for a product"""
    comments = db.query(Comment).filter(Comment.product_id == product_id).all()
    
    if not comments:
        return {
            "product_id": product_id,
            "comment_count": 0,
            "average_sentiment": None
        }
    
    # Calculate average sentiment
    sentiments = [c.sentiment for c in comments if c.sentiment is not None]
    avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else None
    
    return {
        "product_id": product_id,
        "comment_count": len(comments),
        "average_sentiment": avg_sentiment
    }