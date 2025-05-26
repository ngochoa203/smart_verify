from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from schemas.sellers import SellerResponse
from schemas.users import UserResponse

class ProductImage(BaseModel):
    id: Optional[int] = None
    image_url: str
    uploaded_at: datetime

class ProductUnit(BaseModel):
    id: Optional[int] = None
    qr_code: Optional[str] = None
    blockchain_hash: Optional[str] = None
    is_used: bool = False
    used_at: Optional[datetime] = None
    created_at: datetime
    
class ProductUpdate(BaseModel):
    id: int
    name: Optional[str]
    description: Optional[str]
    brand: Optional[str]
    category: Optional[str]
    price: Optional[int]
    quantity: Optional[int]
    created_at: datetime


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
    created_at: datetime

    images: Optional[List[ProductImage]] = None

    seller: Optional[SellerResponse] = None
    user: Optional[UserResponse] = None
    units: Optional[List[ProductUnit]] = None

    class Config:
        from_attributes = True