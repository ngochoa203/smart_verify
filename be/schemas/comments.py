from pydantic import BaseModel
from datetime import datetime
from typing import Optional
    
class Comment(BaseModel):
    product_id: int
    content: str

    class Config:
        from_attributes = True

class Create(Comment):
    id: Optional[int] = None
    user_id: int
    product_id: int
    content: str
    sentiment: Optional[int] = None
    created_at: datetime

class CommentResponse(Comment):
    id: Optional[int] = None
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None
    created_at: datetime
    sentiment: Optional[int] = None

    class Config:
        from_attributes = True