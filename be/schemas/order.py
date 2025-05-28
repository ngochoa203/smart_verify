from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class OrderItem(BaseModel):
    product_id: Optional[int] = None
    quantity: Optional[int] = None
    blockchain_hash: Optional[str] = None

    class Config:
        from_attributes = True
class OrderCreate(BaseModel):
    items: List[OrderItem]

class Item(BaseModel):    
    product_id: int
    name: str
    image_url: str
    price: int
    quantity: int

class OrderResponse(BaseModel):
    id: Optional[int] = None
    user_id: int
    total_amount: Optional[int] = None
    status: Optional[str] = 0
    blockchain_hash: Optional[str] = None
    created_at: datetime

    listItems: List[Item] = []

    class Config:
        from_attributes = True
