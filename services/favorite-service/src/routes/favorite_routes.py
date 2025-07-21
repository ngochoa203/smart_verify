from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy.exc import IntegrityError

from src.database import get_db
from src.models import Favorite
from src.schemas.favorite_schemas import FavoriteCreate, FavoriteResponse

router = APIRouter()

# Health check
@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "favorite-service"}

# Favorite endpoints
@router.post("/favorites", response_model=FavoriteResponse)
async def create_favorite(favorite: FavoriteCreate, db: Session = Depends(get_db)):
    """Add a product to user's favorites"""
    try:
        db_favorite = Favorite(
            user_id=favorite.user_id,
            product_id=favorite.product_id
        )
        db.add(db_favorite)
        db.commit()
        db.refresh(db_favorite)
        return db_favorite
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Product already in favorites"
        )

@router.get("/favorites/user/{user_id}", response_model=List[FavoriteResponse])
async def get_user_favorites(user_id: int, db: Session = Depends(get_db)):
    """Get all favorites for a user"""
    favorites = db.query(Favorite).filter(Favorite.user_id == user_id).all()
    return favorites

@router.get("/favorites/product/{product_id}", response_model=List[FavoriteResponse])
async def get_product_favorites(product_id: int, db: Session = Depends(get_db)):
    """Get all users who favorited a product"""
    favorites = db.query(Favorite).filter(Favorite.product_id == product_id).all()
    return favorites

@router.delete("/favorites/{favorite_id}")
async def delete_favorite(favorite_id: int, db: Session = Depends(get_db)):
    """Remove a product from favorites"""
    db_favorite = db.query(Favorite).filter(Favorite.id == favorite_id).first()
    if not db_favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(db_favorite)
    db.commit()
    return {"message": "Favorite removed successfully"}

@router.delete("/favorites")
async def delete_favorite_by_user_product(
    user_id: int,
    product_id: int,
    db: Session = Depends(get_db)
):
    """Remove a product from favorites by user_id and product_id"""
    db_favorite = db.query(Favorite).filter(
        Favorite.user_id == user_id,
        Favorite.product_id == product_id
    ).first()
    
    if not db_favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(db_favorite)
    db.commit()
    return {"message": "Favorite removed successfully"}

@router.get("/favorites/check")
async def check_favorite(user_id: int, product_id: int, db: Session = Depends(get_db)):
    """Check if a product is in user's favorites"""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == user_id,
        Favorite.product_id == product_id
    ).first()
    
    return {"is_favorite": favorite is not None}