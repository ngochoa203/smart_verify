from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProductImage(BaseModel):
    id: Optional[int] = None
    image_url: str
    uploaded_at: Optional[datetime] = None

class ProductUnit(BaseModel):
    id: Optional[int] = None
    qr_code: str
    is_used: bool = False
    used_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

class Product(BaseModel):
    id: Optional[int] = None
    seller_id: Optional[int] = None
    user_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    price: int
    quantity: int
    created_at: Optional[datetime] = None

    images: Optional[List[ProductImage]] = []
    units: Optional[List[ProductUnit]] = []

    class Config:
        from_attributes = True