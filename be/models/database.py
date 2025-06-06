# database.py
import os
from dotenv import load_dotenv
from psycopg_pool import AsyncConnectionPool

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

pool = AsyncConnectionPool(DATABASE_URL, min_size=1, max_size=100)

async def open_pool():
    await pool.open()

async def close_pool():
    await pool.close()

async def get_connection():
    async with pool.connection() as conn:
        yield conn
