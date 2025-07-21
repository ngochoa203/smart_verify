from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductUnitBase(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    qr_code: str
    blockchain_hash: str

class ProductUnitCreate(ProductUnitBase):
    pass

class ProductUnitResponse(ProductUnitBase):
    id: int
    is_used: bool
    used_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        orm_mode = True

class OwnProductBase(BaseModel):
    product_id: int
    is_seller: bool
    owner_id: int

class OwnProductCreate(OwnProductBase):
    pass

class OwnProductResponse(OwnProductBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class QRVerifyRequest(BaseModel):
    qr_code: str

class QRVerifyResponse(BaseModel):
    is_valid: bool
    product_id: Optional[int] = None
    variant_id: Optional[int] = None
    is_used: Optional[bool] = None
    blockchain_hash: Optional[str] = None
    message: str