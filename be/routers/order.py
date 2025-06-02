from typing import List
from fastapi import APIRouter, Depends, HTTPException
from psycopg import AsyncConnection
from models.database import get_connection
from models.order import (
    create_order,
    get_order_detail_by_id,
    get_orders_by_user_id,
    get_orders_by_product_id,
    update_order_status,
    delete_order,
    get_orders_by_status
)
from schemas.order import OrderResponse, OrderCreate

router = APIRouter()

@router.post("/order/create", response_model=OrderResponse)
async def create_orders(
    user_id: int,
    order_data: OrderCreate,
    db: AsyncConnection = Depends(get_connection)
):
    order = await create_order(user_id, order_data, db)
    if not order:
        raise HTTPException(status_code=400, detail="Unable to create order")
    return order


@router.get("/order/detail/{order_id}", response_model=OrderResponse)
async def get_order_detail(order_id: int, db: AsyncConnection = Depends(get_connection)):
    order = await get_order_detail_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/order/user/{user_id}", response_model=List[OrderResponse])
async def get_orders_by_user(user_id: int, db: AsyncConnection = Depends(get_connection)):
    orders = await get_orders_by_user_id(db, user_id)
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found for user")
    return orders


@router.get("/orders/product/{product_id}", response_model=List[OrderResponse])
async def get_orders_by_product(product_id: int, db: AsyncConnection = Depends(get_connection)):
    orders = await get_orders_by_product_id(db, product_id)
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found for product")
    return orders


@router.put("/order/{order_id}/status")
async def update_order_status_route(
    order_id: int,
    status: str,
    db: AsyncConnection = Depends(get_connection)
):
    result = await update_order_status(db, order_id, status)
    return result


@router.delete("/order/{order_id}")
async def delete_order_route(order_id: int, db: AsyncConnection = Depends(get_connection)):
    result = await delete_order(db, order_id)
    return result


@router.get("/orders/status/{status}", response_model=List[OrderResponse])
async def get_orders_by_status_route(status: str, db: AsyncConnection = Depends(get_connection)):
    orders = await get_orders_by_status(db, status)
    return orders
