from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
    
class CommentCreate(BaseModel):
    user_id: int
    product_id: int
    content: str

class CommentResponse(BaseModel):
    id: Optional[int] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    product_image: Optional[List[str]] = None
    price: Optional[int] = None
    content: str
    sentiment: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True