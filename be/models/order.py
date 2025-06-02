import hashlib
import uuid
from psycopg import AsyncConnection
from schemas.order import OrderCreate

def generate_blockchain_hash():
    raw = str(uuid.uuid4())
    return hashlib.sha256(raw.encode()).hexdigest()

async def create_order(user_id: int, order_data: OrderCreate, db: AsyncConnection):
    query_insert_order = """
        INSERT INTO orders (user_id, total_amount, blockchain_hash)
        VALUES (%s, %s, %s)
        RETURNING id
    """
    blockchain_hash = generate_blockchain_hash()
    total_amount = 0
    async with db.cursor() as cur:
        await cur.execute(query_insert_order, (user_id, total_amount, blockchain_hash))
        row = await cur.fetchone()
        order_id = row[0]

        items_detail = []

        for item in order_data.items:
            query_get_product = """
                SELECT p.price, c.name AS category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = %s
            """
            await cur.execute(query_get_product, (item.product_id,))
            product_row = await cur.fetchone()
            if not product_row:
                continue

            price, category_name = product_row
            item_total = price * item.quantity
            total_amount += item_total

            query_add_order_item = """
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """
            await cur.execute(query_add_order_item, (
                order_id, item.product_id, item.quantity, price
            ))

            query_variants = """
                SELECT id, size, color, quantity, price, created_at
                FROM product_variants
                WHERE product_id = %s
            """
            await cur.execute(query_variants, (item.product_id,))
            variants = await cur.fetchall()
            variant_list = [{
                "id": v[0],
                "size": v[1],
                "color": v[2],
                "quantity": v[3],
                "price": v[4],
                "created_at": v[5],
            } for v in variants]

            items_detail.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": price,
                "category": category_name,
                "variants": variant_list
            })

        query_upd_order = """UPDATE orders SET total_amount = %s WHERE id = %s RETURNING created_at"""
        await cur.execute(query_upd_order, (total_amount, order_id))
        row = await cur.fetchone()
        created_at = row[0]

        return {
            "order_id": order_id,
            "total_amount": total_amount,
            "blockchain_hash": blockchain_hash,
            "created_at": created_at,
            "items": items_detail
        }

async def get_orders_by_user_id(db: AsyncConnection, user_id: int):
    query = """
        SELECT id, user_id, total_amount, status, blockchain_hash, created_at
        FROM orders
        WHERE user_id = %s
        ORDER BY created_at DESC
    """
    async with db.cursor() as cur:
        await cur.execute(query, (user_id,))
        rows = await cur.fetchall()
        return [
            {
                "id": r[0],
                "user_id": r[1],
                "total_amount": r[2],
                "status": r[3],
                "blockchain_hash": r[4],
                "created_at": r[5],
                "items": []
            } for r in rows
        ]

async def get_order_detail_by_id(db: AsyncConnection, order_id: int):
    query_order = """
        SELECT o.id, o.user_id, o.total_amount, o.status, o.blockchain_hash, o.created_at
        FROM orders o
        WHERE o.id = %s
    """
    query_items = """
        SELECT oi.product_id, oi.quantity, oi.price, c.name AS category_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE oi.order_id = %s
    """
    query_variants = """
        SELECT id, size, color, quantity, price, created_at
        FROM product_variants
        WHERE product_id = %s
    """

    async with db.cursor() as cur:
        await cur.execute(query_order, (order_id,))
        order_row = await cur.fetchone()
        if not order_row:
            return None

        await cur.execute(query_items, (order_id,))
        item_rows = await cur.fetchall()

        items_detail = []
        for item in item_rows:
            product_id, quantity, price, category_name = item

            await cur.execute(query_variants, (product_id,))
            variants = await cur.fetchall()
            variant_list = [{
                "id": v[0],
                "size": v[1],
                "color": v[2],
                "quantity": v[3],
                "price": v[4],
                "created_at": v[5]
            } for v in variants]

            items_detail.append({
                "product_id": product_id,
                "quantity": quantity,
                "unit_price": price,
                "category": category_name,
                "variants": variant_list
            })

        return {
            "id": order_row[0],
            "user_id": order_row[1],
            "total_amount": order_row[2],
            "status": order_row[3],
            "blockchain_hash": order_row[4],
            "created_at": order_row[5],
            "items": items_detail
        }

async def get_orders_by_status(db: AsyncConnection, status: str):
    query = """
        SELECT id, user_id, total_amount, blockchain_hash, created_at
        FROM orders
        WHERE status = %s
        ORDER BY created_at DESC
    """
    async with db.cursor() as cur:
        await cur.execute(query, (status,))
        rows = await cur.fetchall()
        return [
            {
                "id": r[0],
                "user_id": r[1],
                "total_amount": r[2],
                "blockchain_hash": r[3],
                "created_at": r[4]
            } for r in rows
        ]

async def update_order_status(db: AsyncConnection, order_id: int, status: int):
    query = """UPDATE orders SET status = %s WHERE id = %s"""
    async with db.cursor() as cur:
        await cur.execute(query, (status, order_id))
    return {"message": "Order status updated", "order_id": order_id, "new_status": status}

async def delete_order(db: AsyncConnection, order_id: int):
    async with db.cursor() as cur:
        await cur.execute("DELETE FROM order_items WHERE order_id = %s", (order_id,))
        await cur.execute("DELETE FROM orders WHERE id = %s", (order_id,))
    return {"message": "Order deleted", "order_id": order_id}

async def get_orders_by_product_id(db: AsyncConnection, product_id: int):
    query = """
        SELECT oi.order_id, o.user_id, o.total_amount, o.status, o.created_at
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.product_id = %s
        ORDER BY o.created_at DESC
    """
    async with db.cursor() as cur:
        await cur.execute(query, (product_id,))
        rows = await cur.fetchall()
        return [
            {
                "order_id": r[0],
                "user_id": r[1],
                "total_amount": r[2],
                "status": r[3],
                "created_at": r[4]
            } for r in rows
        ]
