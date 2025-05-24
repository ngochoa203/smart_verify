from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class FavoriteBase(BaseModel):
    user_id: int
    product_id: int

class FavoriteResponse(FavoriteBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True