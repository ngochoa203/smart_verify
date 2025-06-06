from typing import Optional
from psycopg import AsyncConnection
from passlib.context import CryptContext
from schemas.authen import Authen
from schemas.users import UserCreate, UserResponse
from schemas.sellers import SellerCreate, SellerResponse
from models.helper import create_access_token, verify_pwd, hash_pwd
from datetime import timedelta

async def check_role(db: AsyncConnection, username: str) -> Optional[str]:
    async with db.cursor() as cur:
        await cur.execute("SELECT username FROM users WHERE username = %s", (username,))
        user_row = await cur.fetchone()
        if user_row:
            return "user"
        await cur.execute("SELECT username FROM sellers WHERE username = %s", (username,))
        seller_row = await cur.fetchone()
        if seller_row:
            return "seller"
        return None
    
async def login(db: AsyncConnection, infor: Authen):
    role = await check_role(db, infor.username)
    if not role:
        return {"error": "Username does not exist"}
    
    if role == "user":
        result = await login_user(db, infor)
    else:
        result = await login_seller(db, infor)

    if result == 1:
        return {"error": "Username does not exist"}
    elif result == 2:
        return {"error": "Incorrect password"}
    
    access_token = create_access_token(
        data={"sub": result.username, "role": role, "id": result.id},
        expires_delta=timedelta(minutes=60)
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": result,
        "role": role
    }

async def login_user(db: AsyncConnection, infor: Authen):
    query = """ SELECT * FROM users WHERE username = %s"""
    async with db.cursor() as cur:
        await cur.execute(query, (infor.username,))
        row = await cur.fetchone()
        print("HASH:", row[4])

        if not row:
            return 1
        if not verify_pwd(infor.password, row[3]):
            return 2
        return UserResponse(
            id=row[0],
            username=row[1],
            email=row[2],
            phone=row[4],
            address=row[5],
            avatar_url=row[6],
            is_active=row[7],
            created_at=row[8],
        )

async def register_user(db: AsyncConnection, infor: UserCreate):
    query = """ SELECT username FROM users WHERE username = %s
                UNION    
                SELECT username FROM sellers WHERE username = %s"""
    async with db.cursor() as cur:
        await cur.execute(query, (infor.username, infor.username))
        row = await cur.fetchone()
        if row:
            return 1
    
    hashed_password = hash_pwd(infor.password)
    query = """ INSERT INTO users (username, email, password, phone, address, avatar_url, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id, created_at"""
    async with db.cursor() as cur:
        await cur.execute(query, (
            infor.username,
            infor.email,
            hashed_password,
            infor.phone,
            infor.address,
            infor.avatar_url,
            False
        ))
        user_id = await cur.fetchone()
        return UserResponse(
            id=user_id[0],
            username=infor.username,
            email=infor.email,
            phone=infor.phone,
            address=infor.address,
            avatar_url=infor.avatar_url,
            is_active=False,
            created_at=user_id[1],
        )

async def login_seller(db: AsyncConnection, infor: Authen):
    query = """ SELECT * FROM sellers WHERE username = %s"""
    async with db.cursor() as cur:
        await cur.execute(query, (infor.username,))
        row = await cur.fetchone()
        if not row:
            return 1
        if not verify_pwd(infor.password, row[3]):
            return 2
        return UserResponse(
            id=row[0],
            username=row[1],
            email=row[2],
            phone=row[4],
            shop_name=row[5],
            shop_description=row[6],
            logo_url=row[7],
            is_verified=row[8],
            created_at=row[9],
        )
async def register_seller(db: AsyncConnection, infor: SellerCreate):
    query = """ SELECT username FROM users WHERE username = %s
                UNION    
                SELECT username FROM sellers WHERE username = %s"""
    async with db.cursor() as cur:
        await cur.execute(query, (infor.username, infor.username))
        row = await cur.fetchone()
        if row:
            return 1
    
    hashed_password = hash_pwd(infor.password)
    query = """ INSERT INTO sellers (username, email, password, phone, shop_name, shop_description, logo_url, is_verified)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id, created_at"""
    async with db.cursor() as cur:
        await cur.execute(query, (
            infor.username,
            infor.email,
            hashed_password,
            infor.phone,
            infor.shop_name,
            infor.shop_description,
            infor.logo_url,
            False
        ))
        seller_id = await cur.fetchone()
        return SellerResponse(
            id=seller_id[0],
            username=infor.username,
            email=infor.email,
            phone=infor.phone,
            shop_name=infor.shop_name,
            shop_description=infor.shop_description,
            logo_url=infor.logo_url,
            is_verified=False,
            created_at=seller_id[1],
        )
    
async def logout():
    return {"message": "Logout successful"}