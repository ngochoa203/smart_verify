from psycopg import AsyncConnection
from schemas.favorite import FavoriteCreate
async def add_favorite(data: FavoriteCreate,db: AsyncConnection):
    query = """INSERT INTO favorites (product_id, user_id)
                VALUES (%s, %s)
                RETURNING id
            """
    async with db.cursor() as cur:
        await cur.execute(query, (
            data.product_id,
            data.user_id
        ))
        row = await cur.fetchone()
        return {"id": row[0],"message": "Add done"}

async def get_product_favorite_by_user_id (user_id: int, db: AsyncConnection):
    query = """
        SELECT f.id, f.product_id, p.name, p.price, f.user_id, f.created_at, m.image_url
        FROM favorites f
        LEFT JOIN products p ON f.product_id = p.id
        LEFT JOIN product_images m ON f.product_id = m.product_id
        WHERE f.user_id = %s
        ORDER BY f.id, m.id
    """
    async with db.cursor() as cur:
        await cur.execute(query, (user_id,))
        rows = await cur.fetchall()
        prd_favor = []
        for row in rows:
            prd_favor.append({
                "id": row[0],
                "product_id": row[1],
                "name": row[2],
                "price": row[3],
                "user_id": row[4],
                "created_at": row[5],
                "images": row[6],
            })
        return prd_favor

async def del_favorite(favor_id: int, db: AsyncConnection):
    query = """DELETE FROM favorites WHERE id =%s"""
    async with db.cursor() as cur:
        await cur.execute(query, (favor_id))
        row = await cur.fetchone()
        return {"id": row[0],"message": "Delete done"}