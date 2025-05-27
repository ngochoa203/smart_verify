from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class FavoriteCreate(BaseModel):
    product_id: int
    user_id: int

class FavoriteResponse(BaseModel):
    id: int
    product_id: int
    name: str
    price: float
    user_id: int
    created_at: datetime
    images: Optional[str] = None

    class Config:
        from_attributes = True