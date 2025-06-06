from psycopg import AsyncConnection

async def get_user_by_id(db: AsyncConnection, user_id: int):
    query = """SELECT * FROM users WHERE id = %s"""
    async with db.cursor() as cur:
        await cur.execute(query, (user_id,))
        row = await cur.fetchone()
        if not row:
            return None
        return {
            "id": row[0],
            "username": row[1],
            "email": row[2],
            "phone": row[4],
            "address": row[5],
            "avatar_url": row[6],
            "is_active": row[7],
            "created_at": row[8],
        }
async def update_user(db: AsyncConnection, user_id: int, user_data: dict):
    query = """UPDATE users SET username = %s, email = %s, password = %s, phone = %s, address = %s, avatar_url = %s
               WHERE id = %s RETURNING id, username, email, password, phone, address, avatar_url, is_active, created_at"""
    async with db.cursor() as cur:
        await cur.execute(query, (
            user_data.username,
            user_data.email,
            user_data.password,
            user_data.phone,
            user_data.address,
            user_data.avatar_url,
            user_id
        ))
        updated_row = await cur.fetchone()
        if not updated_row:
            return None
        return {
            "id": updated_row[0],
            "username": updated_row[1],
            "email": updated_row[2],
            "phone": updated_row[4],
            "address": updated_row[5],
            "avatar_url": updated_row[6],
            "is_active": updated_row[7],
            "created_at": updated_row[8],
        }