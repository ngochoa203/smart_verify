from pydantic import BaseModel
from typing import Optional, List

class CategoryBase(BaseModel):
    name: str
    parent_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    class Config:
        from_attributes = True

class CategoryWithChildren(Category):
    children: List['CategoryWithChildren'] = []
    # CategoryWithChildren.update_forward_refs()

