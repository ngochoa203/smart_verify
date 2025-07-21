from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItemBase(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int
    price: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    user_id: int
    total_amount: int
    status: int = 0  # 0: pending, 1: shipped, 2: completed, 3: canceled

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: Optional[int] = None
    blockchain_hash: Optional[str] = None

class OrderResponse(OrderBase):
    id: int
    blockchain_hash: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        orm_mode = True