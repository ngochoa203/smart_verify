from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from psycopg import AsyncConnection

from models.category import create_category, get_all_categories, get_category_tree
from schemas.category import Category, CategoryCreate, CategoryWithChildren
from models.database import get_connection
router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED)
async def api_create_category(category: CategoryCreate, db: AsyncConnection = Depends(get_connection)):
    return await create_category(category, db)

@router.get("/", response_model=List[Category])
async def api_get_all_categories(db: AsyncConnection = Depends(get_connection)):
    return await get_all_categories(db)

@router.get("/tree", response_model=List[CategoryWithChildren])
async def api_get_category_tree(db: AsyncConnection = Depends(get_connection)):
    return await get_category_tree(db)
