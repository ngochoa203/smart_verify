from psycopg import AsyncConnection


async def get_payment_methods(db: AsyncConnection):
    query = "SELECT * FROM payment_methods"
    async with db.cursor() as cur:
        await cur.execute(query)
        rows = await cur.fetchall()
        result = []
        for row in rows:
            payment_method = {
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "is_active": row[3]
            }
            result.append(payment_method)
    return result