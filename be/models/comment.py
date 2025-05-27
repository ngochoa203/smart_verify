import os
import httpx
from psycopg import AsyncConnection
from dotenv import load_dotenv

load_dotenv()

API_URL =os.getenv("API_URL")

async def fetch_sentiment(text: str) -> int:
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{API_URL}/sentiment/", json={"text": text})
        resp.raise_for_status()
        data = resp.json()
        return int(data["sentiment"])

async def create_comment(db: AsyncConnection, comment_data: dict) -> dict:
    sentiment = await fetch_sentiment(comment_data["content"])
    query = """
        INSERT INTO comments (user_id, product_id, content, sentiment)
        VALUES (%s, %s, %s, %s)
        RETURNING id, user_id, product_id, content, sentiment, created_at
    """
    async with db.cursor() as cur:
        await cur.execute(query, (
            comment_data["user_id"],
            comment_data["product_id"],
            comment_data["content"],
            sentiment
        ))
        row = await cur.fetchone()
        return {
            "id": row[0],
            "user_id": row[1],
            "product_id": row[2],
            "content": row[3],
            "sentiment": row[4],
            "created_at": row[5],
        }

async def get_comment_by_product (db: AsyncConnection, product_id:int):
    query = """
        SELECT m.id, u.username, u.avatar_url, m.product_id, m.content, m.sentiment, m.created_at
        FROM comments m
        LEFT JOIN users u ON m.user_id = u.id
        WHERE m.product_id = %s
    """
    async with db.cursor() as cur:
        await cur.execute(query, (product_id,))
        rows = await cur.fetchall()
        comments = []
        for row in rows:
            comments.append({
                "id":row[0],
                "username":row[1],
                "avatar_url":row[2],
                "product_id": row[3],
                "content": row[4],
                "sentiment":row[5],
                "created_at":row[6],
            })
        return comments

async def delete_comment (db: AsyncConnection, comment_id:int):
    query = """DELETE FROM comments WHERE id =%s RETURNING id"""
    async with db.cursor() as cur:
        await cur.execute(query, (comment_id,))
    deleted_row = await cur.fetchone()
    if not deleted_row:
        return None
    return {"id": deleted_row[0], "message":"Comment deleted successfully"}