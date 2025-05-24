from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class OrderItem(BaseModel):
    id: Optional[int] = None
    product_id: int
    quantity: int
    price: Optional[int] = None
    total_price: Optional[int] = None

    class Config:
        from_attributes = True

class Order(BaseModel):
    id: Optional[int] = None
    user_id: int
    total_amount: Optional[int] = None
    status: Optional[str] = 0
    blockchain_hash: Optional[str] = None
    created_at: Optional[datetime] = None

    items: List[OrderItem] = []

    class Config:
        from_attributes = True
