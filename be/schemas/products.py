from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from schemas.sellers import SellerResponse
from schemas.users import UserResponse

class ProductVariantCreate(BaseModel):
    size: str
    color: str
    quantity: int
    price: Optional[int] = None

class ProductVariant(BaseModel):
    id: Optional[int] = None
    product_id: int
    size: str
    color: str
    quantity: int
    price: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

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

class Product(BaseModel):
    id: Optional[int] = None
    seller_id: Optional[int] = None
    user_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    brand: Optional[str] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None    
    price: Optional[int] = None
    created_at: datetime

    images: Optional[List[ProductImage]] = None
    variants: Optional[List[ProductVariant]] = None 
    units: Optional[List[ProductUnit]] = None

    seller: Optional[SellerResponse] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True
