from fastapi import APIRouter, HTTPException, Depends, status
from psycopg import AsyncConnection
from models.users import get_user_by_id
from models.database import get_connection
from schemas.users import UserResponse, UserUpdate
from models.users import update_user


router = APIRouter(tags=["Users"])

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: AsyncConnection = Depends(get_connection)):
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user_infor(user_id: int, user: UserUpdate, db: AsyncConnection = Depends(get_connection)):
    updated_user = await update_user(db, user_id, user)
    if not updated_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return updated_user
    
