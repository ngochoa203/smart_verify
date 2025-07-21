from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy.exc import IntegrityError

from src.database import get_db
from src.models import CartItem
from src.schemas.cart_schemas import CartItemCreate, CartItemUpdate, CartItemResponse, CartSummary

router = APIRouter()

# Health check
@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "cart-service"}

# Cart endpoints
@router.post("/cart-items", response_model=CartItemResponse)
async def add_to_cart(cart_item: CartItemCreate, db: Session = Depends(get_db)):
    """Add item to cart"""
    try:
        # Check if item already exists in cart
        existing_item = db.query(CartItem).filter(
            CartItem.user_id == cart_item.user_id,
            CartItem.product_id == cart_item.product_id,
            CartItem.variant_id == cart_item.variant_id
        ).first()
        
        if existing_item:
            # Update quantity
            existing_item.quantity += cart_item.quantity
            db.commit()
            db.refresh(existing_item)
            return existing_item
        
        # Create new cart item
        db_cart_item = CartItem(**cart_item.dict())
        db.add(db_cart_item)
        db.commit()
        db.refresh(db_cart_item)
        return db_cart_item
    
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Invalid cart item data"
        )

@router.get("/cart/{user_id}", response_model=CartSummary)
async def get_user_cart(user_id: int, db: Session = Depends(get_db)):
    """Get user's cart"""
    cart_items = db.query(CartItem).filter(CartItem.user_id == user_id).all()
    
    return CartSummary(
        user_id=user_id,
        total_items=len(cart_items),
        items=cart_items
    )

@router.put("/cart-items/{cart_item_id}", response_model=CartItemResponse)
async def update_cart_item(
    cart_item_id: int,
    cart_item_update: CartItemUpdate,
    db: Session = Depends(get_db)
):
    """Update cart item quantity"""
    db_cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()
    if not db_cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    if cart_item_update.quantity <= 0:
        # Remove item if quantity is 0 or negative
        db.delete(db_cart_item)
        db.commit()
        raise HTTPException(status_code=200, detail="Item removed from cart")
    
    # Update quantity
    db_cart_item.quantity = cart_item_update.quantity
    db.commit()
    db.refresh(db_cart_item)
    return db_cart_item

@router.delete("/cart-items/{cart_item_id}")
async def remove_from_cart(cart_item_id: int, db: Session = Depends(get_db)):
    """Remove item from cart"""
    db_cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()
    if not db_cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(db_cart_item)
    db.commit()
    return {"message": "Item removed from cart"}

@router.delete("/cart/{user_id}")
async def clear_cart(user_id: int, db: Session = Depends(get_db)):
    """Clear user's cart"""
    db.query(CartItem).filter(CartItem.user_id == user_id).delete()
    db.commit()
    return {"message": "Cart cleared successfully"}