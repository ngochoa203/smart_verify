import os
from dotenv import load_dotenv
import psycopg
from psycopg_pool import AsyncConnectionPool

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

pool = AsyncConnectionPool(DATABASE_URL, min_size=1, max_size=100)

async def get_connection():
    async with pool.connection() as conn:
        yield conn