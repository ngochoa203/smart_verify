from psycopg import AsyncConnection

from routers.admin import AdminLogin
from models.helper import verify_pwd

async def login_admin(db: AsyncConnection, data: AdminLogin):
    query = """ SELECT id, username, password, created_at
        FROM admin WHERE username = %s """
    async with db.cursor() as cursor:
        await cursor.execute(query, (data.username,))
        result = await cursor.fetchone()
        if result:
            password = result[2]
            if verify_pwd(data.password, password):
                return {
                    "id": result[0],
                    "username": result[1],
                    "created_at": result[3],
                }
        else:
            return None

async def get_all_users(db: AsyncConnection):
    query = """SELECT id, username, email, phone, address, avatar_url, is_active, created_at FROM users"""
    async with db.cursor() as cursor:
        await cursor.execute(query)
        rows = await cursor.fetchall()
        return [
            {
                "id": row[0],
                "username": row[1],
                "email": row[2],
                "phone": row[3],
                "address": row[4],
                "avatar_url": row[5],
                "is_active": row[6],
                "created_at": row[7],
            } for row in rows
        ]

async def get_user_by_id(db: AsyncConnection, user_id: int):
    query = """SELECT id, username, email, phone, address, avatar_url, is_active, created_at FROM users WHERE id = %s"""
    async with db.cursor() as cursor:
        await cursor.execute(query, (user_id,))
        row = await cursor.fetchone()
        if row:
            return {
                "id": row[0],
                "username": row[1],
                "email": row[2],
                "phone": row[3],
                "address": row[4],
                "avatar_url": row[5],
                "is_active": row[6],
                "created_at": row[7],
            }
        return None

async def update_user(db: AsyncConnection, user_id: int, user_data: dict):
    fields = []
    values = []

    if "username" in user_data:
        fields.append("username = %s")
        values.append(user_data["username"])
    if "email" in user_data:
        fields.append("email = %s")
        values.append(user_data["email"])
    if "phone" in user_data:
        fields.append("phone = %s")
        values.append(user_data["phone"])
    if "address" in user_data:
        fields.append("address = %s")
        values.append(user_data["address"])
    if "avatar_url" in user_data:
        fields.append("avatar_url = %s")
        values.append(user_data["avatar_url"])
    if "is_active" in user_data:
        fields.append("is_active = %s")
        values.append(user_data["is_active"])

    if not fields:
        return None

    query = f"UPDATE users SET {', '.join(fields)} WHERE id = %s RETURNING id, username, email, phone, address, avatar_url, is_active, created_at"
    values.append(user_id)

    async with db.cursor() as cursor:
        await cursor.execute(query, tuple(values))
        row = await cursor.fetchone()
        if row:
            return {
                "id": row[0],
                "username": row[1],
                "email": row[2],
                "phone": row[3],
                "address": row[4],
                "avatar_url": row[5],
                "is_active": row[6],
                "created_at": row[7],
            }
    return None