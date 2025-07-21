from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CartItemBase(BaseModel):
    user_id: int
    product_id: int
    variant_id: Optional[int] = None
    quantity: int = 1

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(CartItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class CartSummary(BaseModel):
    user_id: int
    total_items: int
    items: List[CartItemResponse]