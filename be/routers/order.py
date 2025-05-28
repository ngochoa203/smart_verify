from fastapi import APIRouter, Depends, HTTPException
from psycopg import AsyncConnection
from models.database import get_connection
from models.order import create_order
from schemas.order import OrderResponse, OrderCreate

router = APIRouter()

# @router.post("/order/create", response_model=OrderResponse)
@router.post("/order/create")
async def create_orders(user_id: int, order_data: OrderCreate, db: AsyncConnection = Depends (get_connection)):
    orders = await create_order(user_id, order_data, db)
    if not orders:
        raise HTTPException(status_code=401, detail="Error or not found")
    return {"message":"Created"}

@router.get("/order/detail/{order_id}", response_model=OrderResponse)
async def get_order_detail(order_id: int, db: AsyncConnection = Depends(get_connection)):
    return None