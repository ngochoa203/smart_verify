from typing import List
from fastapi import APIRouter, Depends
from psycopg import AsyncConnection
from models.database import get_connection
from models.favorite import add_favorite, del_favorite, get_product_favorite_by_user_id
from schemas.favorite import FavoriteResponse, FavoriteCreate

router = APIRouter()

@router.post("/favorite/add")
async def add_to_favorite(payload: FavoriteCreate, db: AsyncConnection = Depends(get_connection)):
    await add_favorite(payload, db)
    return {"message": "Add done"}

@router.get("favorite/product/{user_id}", response_model=List[FavoriteResponse])
async def get_all_favor_by_id (user_id: int, db: AsyncConnection = Depends(get_connection)):
    favorites = await get_product_favorite_by_user_id(user_id, db)
    return favorites

@router.delete("/favorite/delete")
async def del_to_favorite(favor_id: int,db: AsyncConnection = Depends(get_connection)):
    await del_favorite(favor_id, db)
    return {"message": "Deleted"}