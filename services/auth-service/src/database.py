from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
import time

from .config import get_database_url, get_debug_mode

# ───────────────────────────────────────
# DATABASE CONFIGURATION
# ───────────────────────────────────────
DATABASE_URL = get_database_url()
DEBUG = get_debug_mode()

engine = create_engine(
    DATABASE_URL,
    echo=DEBUG,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=10,
    max_overflow=20,
    connect_args={
        "connect_timeout": 10,
        "application_name": "pathlight_auth_service"
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ───────────────────────────────────────
# FASTAPI DEPENDENCY
# ───────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ───────────────────────────────────────
# SCRIPT / CLI CONTEXT MANAGER
# ───────────────────────────────────────
@contextmanager
def get_db_context():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ───────────────────────────────────────
# TABLE INITIALIZATION LOGIC
# ───────────────────────────────────────
def create_tables():
    """Create all tables with retry logic."""
    from .models import User, Admin, Seller  # ensure models loaded

    Base.metadata.bind = engine

    max_retries = 5
    delay = 2

    for attempt in range(1, max_retries + 1):
        try:
            # Test connection
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))

            # Actually create tables
            Base.metadata.create_all(engine)

            print(f"✅ Tables created successfully (attempt {attempt})")
            return

        except Exception as e:
            print(f"❌ Attempt {attempt} to create tables failed: {e}")
            if attempt < max_retries:
                print(f"⏳ Retrying in {delay} seconds...")
                time.sleep(delay)
                delay *= 2
            else:
                print("❗ Failed to create tables after all retries.")
                raise


def check_tables_exist():
    """Verify required tables exist."""
    try:
        with engine.connect() as conn:
            inspector = inspect(conn)
            existing = set(inspector.get_table_names())
            required = {'users', 'admins', 'token_blacklist'}

            missing = required - existing
            if missing:
                print(f"⚠️  Missing tables: {missing}")
                return False
            else:
                print("✅ All required tables exist.")
                return True

    except Exception as e:
        print(f"❌ Error during table check: {e}")
        return False


def ensure_tables():
    """Ensure all required tables exist."""
    if not check_tables_exist():
        print("🔧 Creating missing tables...")
        create_tables()
    else:
        print("🔁 Skipping table creation — all exist.")
