from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Category schemas
class CategoryBase(BaseModel):
    name: str
    parent_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[int] = None

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# Product schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    brand: Optional[str] = None
    category_id: Optional[int] = None
    price: int

class ProductCreate(ProductBase):
    seller_id: int

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    brand: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[int] = None

class ProductVariantBase(BaseModel):
    size: str
    color: str
    quantity: int
    price: Optional[int] = None

class ProductVariantCreate(ProductVariantBase):
    pass

class ProductVariantUpdate(BaseModel):
    size: Optional[str] = None
    color: Optional[str] = None
    quantity: Optional[int] = None
    price: Optional[int] = None

class ProductVariantResponse(ProductVariantBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True

class ProductImageCreate(BaseModel):
    image_url: str

class ProductImageResponse(BaseModel):
    id: int
    product_id: int
    image_url: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

class ProductResponse(ProductBase):
    id: int
    seller_id: int
    created_at: datetime
    variants: List[ProductVariantResponse] = []
    images: List[ProductImageResponse] = []

    class Config:
        from_attributes = True