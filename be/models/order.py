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
        # Tạo đơn hàng ban đầu với tổng tiền = 0
        await cur.execute(query_insert_order, (user_id, total_amount, blockchain_hash))
        row = await cur.fetchone()
        order_id = row[0]

        items_detail = []

        for item in order_data.items:
            # Lấy thông tin sản phẩm (gồm price, category)
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

            # Thêm item vào bảng order_items
            query_add_order_item = """
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """
            await cur.execute(query_add_order_item, (
                order_id, item.product_id, item.quantity, price
            ))

            # Lấy variant liên quan
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

            # Lưu thông tin item chi tiết
            items_detail.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": price,
                "category": category_name,
                "variants": variant_list
            })

        # Cập nhật tổng tiền cuối cùng vào bảng orders
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


async def get_order_by_id(db, order_id):
   query = """SELECT """

async def get_orders_by_user_id(db, user_id):
    return None

async def get_orders_by_status(db, status):
    return None

async def update_order_status(db, order_id, status):
    return None

async def delete_order(db, order_id):
    return None

async def get_orders_by_product_id(dc, product_id):
    return None
