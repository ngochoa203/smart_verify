from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class Seller(BaseModel):
    username: str
    email: str
    phone: Optional[str] = None
    shop_name: Optional[str] = None
    shop_description: str = None
    logo_url: Optional[str] = None
    is_active: Optional[bool] = False

class SellerCreate(Seller):
    password: str

class SellerResponse(Seller):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True