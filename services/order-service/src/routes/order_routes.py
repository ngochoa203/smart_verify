from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import hashlib
import uuid
from datetime import datetime

from src.database import get_db
from src.models import Order, OrderItem
from src.schemas.order_schemas import (
    OrderCreate, OrderUpdate, OrderResponse,
    OrderItemCreate, OrderItemResponse
)

router = APIRouter()

# Health check
@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "order-service"}

# Helper function to generate blockchain hash
def generate_blockchain_hash(order_id: int, user_id: int) -> str:
    """Generate a blockchain-like hash for order verification"""
    data = f"{order_id}_{user_id}_{uuid.uuid4()}_{datetime.utcnow().timestamp()}"
    return hashlib.sha256(data.encode()).hexdigest()

# Order endpoints
@router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order"""
    # Create order
    db_order = Order(
        user_id=order_data.user_id,
        total_amount=order_data.total_amount,
        status=order_data.status
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Create order items
    order_items = []
    for item_data in order_data.items:
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=item_data.product_id,
            variant_id=item_data.variant_id,
            quantity=item_data.quantity,
            price=item_data.price
        )
        db.add(db_item)
        order_items.append(db_item)
    
    db.commit()
    
    # Generate blockchain hash
    blockchain_hash = generate_blockchain_hash(db_order.id, db_order.user_id)
    db_order.blockchain_hash = blockchain_hash
    db.commit()
    db.refresh(db_order)
    
    # Load items for response
    db_order.items = order_items
    
    return db_order

@router.get("/orders", response_model=List[OrderResponse])
async def get_orders(
    user_id: Optional[int] = None,
    status: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all orders with optional filters"""
    query = db.query(Order)
    
    # Apply filters
    if user_id:
        query = query.filter(Order.user_id == user_id)
    if status is not None:
        query = query.filter(Order.status == status)
    
    orders = query.offset(skip).limit(limit).all()
    
    # Load items for each order
    for order in orders:
        order.items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    
    return orders

@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get order by ID"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Load items
    order.items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    
    return order

@router.put("/orders/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db)
):
    """Update order status"""
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    for field, value in order_update.dict(exclude_unset=True).items():
        setattr(db_order, field, value)
    
    db.commit()
    db.refresh(db_order)
    
    # Load items
    db_order.items = db.query(OrderItem).filter(OrderItem.order_id == db_order.id).all()
    
    return db_order

@router.delete("/orders/{order_id}")
async def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete order (admin only)"""
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Delete related items
    db.query(OrderItem).filter(OrderItem.order_id == order_id).delete()
    
    db.delete(db_order)
    db.commit()
    return {"message": "Order deleted successfully"}