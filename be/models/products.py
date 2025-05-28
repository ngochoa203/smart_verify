import hashlib
import json
import os
from typing import Any, Dict, List
import uuid
from psycopg import AsyncConnection
import qrcode
from schemas.products import ProductImage, ProductVariantCreate
from schemas.sellers import SellerResponse
from datetime import datetime

UPLOAD_FOLDER = "res/images"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
QRCODE_FOLDER = "res/qrcode"
os.makedirs(QRCODE_FOLDER, exist_ok=True)

def save_image(img: bytes) -> str:
    today = datetime.now().strftime("%Y%m%d")
    folder_path = os.path.join(UPLOAD_FOLDER, today)
    os.makedirs(folder_path, exist_ok=True)

    filename = f"{uuid.uuid4()}.jpg"
    file_path = os.path.join(folder_path, filename)
    with open(file_path, "wb") as f:
        f.write(img)
    return os.path.join("res/images", today, filename)

def gen_qrcode(blockchain_hash: str, variant_id: int):
    product_qr_folder = os.path.join(QRCODE_FOLDER, str(variant_id))
    os.makedirs(product_qr_folder, exist_ok=True)
    
    file_name = f"{blockchain_hash}.png"
    file_path = os.path.join(product_qr_folder, file_name)
    img = qrcode.make(blockchain_hash)
    img.save(file_path)
    return os.path.join("res/qrcode", str(variant_id), file_name)

def generate_blockchain_hash(name: str, brand: str, variant_id: int, index: int) -> str:
    raw = f"{name}-{brand}-{variant_id}-{index}-{uuid.uuid4()}"
    return hashlib.sha256(raw.encode()).hexdigest()

async def add_product(
            db: AsyncConnection,
            product_data:dict,
            is_seller: bool,
            owner_id: int,
            images : List[str],
            variants: List[ProductVariantCreate]
        ) -> Dict[str, Any]:
    
    seller_id = owner_id if is_seller else None
    user_id = owner_id if not is_seller else None
 
    async with db.cursor() as cur:
        query_product = """
            INSERT INTO products (seller_id, user_id, name, description, brand, category_id, price)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """
        await cur.execute(query_product, (
            seller_id,
            user_id,
            product_data["name"],
            product_data["description"],
            product_data["brand"],
            product_data["category_id"],
            product_data["price"],
        ))
        product_row = await cur.fetchone()
        product_id = product_row[0]

        query_owner = """
            INSERT INTO own_products (product_id, is_seller, owner_id)
            VALUES (%s, %s, %s)
        """
        await cur.execute(query_owner, (product_id, is_seller, owner_id))

        query_images = """
            INSERT INTO product_images (product_id, image_url)
            VALUES (%s, %s)
        """
        for img in images:
            img_path = save_image(img)
            await cur.execute(query_images, (product_id, img_path))

        query_variant = """
            INSERT INTO product_variants (product_id, size, color, quantity, price)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """
        variants_list = []
        if is_seller:
            for variant in variants:
                await cur.execute(query_variant, (
                                product_id,
                                variant.size, 
                                variant.color,
                                variant.quantity,
                                variant.price))
                variant_row = await cur.fetchone()
                variant_id = variant_row[0]

                for i in range(variant.quantity):
                    name = product_data["name"]
                    brand = product_data["brand"]
                    blockchain_hash = generate_blockchain_hash(name, brand, variant_id, i)
                    qr_code = gen_qrcode(blockchain_hash, variant_id)
                    query_unit = """
                        INSERT INTO product_units (
                            product_id, variant_id, qr_code, blockchain_hash)
                        VALUES (%s, %s, %s, %s)
                    """
                    await cur.execute(query_unit, (product_id,variant_id, qr_code,blockchain_hash))
        return {
            "id": product_id,
            "created_at": product_row[1]
        }

async def get_product_by_id(db: AsyncConnection, product_id: int) -> dict | None:
    query = """
        SELECT  
            p.id, p.seller_id, p.user_id, p.name, p.description, 
            p.brand, p.category_id, c.name AS category_name, p.price, v.quantity, p.created_at,
            
            COALESCE(
                JSON_AGG(DISTINCT jsonb_build_object(
                    'id', m.id,
                    'image_url', m.image_url,
                    'uploaded_at', m.uploaded_at
                )) FILTER (WHERE m.id IS NOT NULL), '[]'
            ) AS images,
            
            CASE
                WHEN op.is_seller = FALSE THEN jsonb_build_object(
                    'id', u.id,
                    'username', u.username,
                    'email', u.email,
                    'phone', u.phone,
                    'address', u.address,
                    'avatar_url', u.avatar_url,
                    'is_active', u.is_active,
                    'created_at', u.created_at
                ) ELSE NULL
            END AS "user",
            
            CASE
                WHEN op.is_seller = TRUE THEN jsonb_build_object(
                    'id', s.id,
                    'username', s.username,
                    'email', s.email,
                    'phone', s.phone,
                    'shop_name', s.shop_name,
                    'shop_description', s.shop_description,
                    'logo_url', s.logo_url,
                    'is_verified', s.is_verified,
                    'created_at', s.created_at
                ) ELSE NULL
            END AS seller,
            
            COALESCE(
                JSON_AGG(
                    jsonb_build_object(
                        'id', v.id,
                        'product_id', v.product_id,
                        'size', v.size,
                        'color', v.color,
                        'quantity', v.quantity,
                        'price', v.price,
                        'created_at', v.created_at
                    ) ORDER BY v.id
                ) FILTER (WHERE v.id IS NOT NULL), '[]'
            ) AS variants,
            
            COALESCE(
                JSON_AGG(
                    jsonb_build_object(
                        'id', pu.id,
                        'qr_code', pu.qr_code,
                        'blockchain_hash', pu.blockchain_hash,
                        'is_used', pu.is_used,
                        'used_at', pu.used_at,
                        'created_at', pu.created_at
                    ) ORDER BY pu.id
                ) FILTER (WHERE pu.id IS NOT NULL), '[]'
            ) AS units
            
        FROM products p
        JOIN own_products op ON p.id = op.product_id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN users u ON op.is_seller = FALSE AND op.owner_id = u.id
        LEFT JOIN sellers s ON op.is_seller = TRUE AND op.owner_id = s.id
        LEFT JOIN product_images m ON p.id = m.product_id
        LEFT JOIN product_variants v ON p.id = v.product_id
        LEFT JOIN product_units pu ON p.id = pu.product_id
        
        WHERE p.id = %s
        
        GROUP BY p.id, u.id, s.id, op.is_seller, v.id, c.name
        ORDER BY v.id
    """
    async with db.cursor() as cur:
        await cur.execute(query, (product_id,))
        row = await cur.fetchone()
        if not row:
            return None
        product_data = {
            "id": row[0],
            "seller_id": row[1],
            "user_id": row[2],
            "name": row[3],
            "description": row[4],
            "brand": row[5],
            "category_id": row[6],
            "category_name": row[7],
            "price": row[8],
            "quantity": row[9],
            "created_at": row[10],
            "images": row[11],
            "user": row[12],
            "seller": row[13],
            "variants": row[14],
            "units": row[15],
        }
        return product_data

async def get_products_by_seller(db:AsyncConnection, seller_id):
    query = """ SELECT p.id, p.name, p.description, p.brand, p.category_id, p.price, p.created_at,
                        COALESCE(JSON_AGG(DISTINCT jsonb_build_object(
                            'id', m.id,
                            'image_url', m.image_url,
                            'uploaded_at', m.uploaded_at
                        )) FILTER (WHERE m.id IS NOT NULL), '[]') AS images
                FROM products p
                JOIN product_images m ON p.id = m.product_id
                WHERE p.seller_id = %s
                GROUP BY p.id"""
    async with db.cursor() as cur:
        await cur.execute(query, (seller_id,))
        rows = await cur.fetchall()
        if not rows:
            return None
        products = []
        for row in rows:
            products.append({
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "brand": row[3],
                "category_id": row[4],
                "price": row[5],
                "created_at": row[6],
                "images": row[7]
            })
        return products

async def get_products_by_user(db: AsyncConnection, user_id: int):
    query = """SELECT   p.id, p.name, p.description, p.brand, p.price, p.created_at,
                        COALESCE(JSON_AGG(DISTINCT jsonb_build_object(
                            'id', m.id,
                            'image_url', m.image_url,
                            'uploaded_at', m.uploaded_at
                        )) FILTER (WHERE m.id IS NOT NULL), '[]') AS images
            FROM products p
            LEFT JOIN product_images m On p.id = m.product_id
            WHERE user_id = %s
            GROUP BY p.id"""
    async with db.cursor() as cur:
        await cur.execute(query, (user_id,))
        rows = await cur.fetchall()
        if not rows:
            return None
        products = []
        for row in rows:
            products.append({
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "brand": row[3],
                "price": row[4],
                "created_at": row[5],
                "images": row[6]
            })
        return products
    
async def delete_product(db: AsyncConnection, product_id: int):
    query = """DELETE FROM products WHERE id = %s RETURNING id"""
    async with db.cursor() as cur:
        await cur.execute(query, (product_id,))
        deleted_row = await cur.fetchone()
        if not deleted_row:
            return None
        return {"id": deleted_row[0], "message": "Product deleted successfully"}

async def get_all_products(db: AsyncConnection):
    query = """
        SELECT 
            p.id, p.seller_id, p.user_id, p.name, p.description, p.brand, 
            c.name AS category_name, p.price, v.quantity, p.created_at,
            
            COALESCE(JSON_AGG(DISTINCT jsonb_build_object(
                'id', m.id,
                'image_url', m.image_url,
                'uploaded_at', m.uploaded_at
            )) FILTER (WHERE m.id IS NOT NULL), '[]') AS images,
            
            COALESCE(JSON_AGG(DISTINCT jsonb_build_object(
                'id', v.id,
                'product_id', v.product_id,
                'size', v.size,
                'color', v.color,
                'quantity', v.quantity,
                'price', v.price,
                'created_at', v.created_at
            )) FILTER (WHERE v.id IS NOT NULL), '[]') AS variants

        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_images m ON p.id = m.product_id
        LEFT JOIN product_variants v ON p.id = v.product_id
        GROUP BY p.id, c.name, v.id
    """
    
    async with db.cursor() as cur:
        await cur.execute(query)
        rows = await cur.fetchall()
        if not rows:
            return []
        
        products = []
        for row in rows:
            products.append({
                "id": row[0],
                "seller_id": row[1],
                "user_id": row[2],
                "name": row[3],
                "description": row[4],
                "brand": row[5],
                "category_name": row[6],  
                "price": row[7],
                "quantity": row[8],
                "created_at": row[9],
                "images": row[10],
                "variants": row[11],
                "units": [] 
            })
        return products

