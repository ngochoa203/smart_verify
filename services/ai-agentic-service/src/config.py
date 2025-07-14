import os
from typing import Optional
from pydantic import BaseSettings
class Settings(BaseSettings):
    DATABASE_USER: str = os.getenv("DATABASE_USER", "user")
    DATABASE_PASSWORD: str = os.getenv("DATABASE_PASSWORD", "password")
    DATABASE_HOST: str = os.getenv("DATABASE_HOST", "ai-agentic-db")
    DATABASE_PORT: str = os.getenv("DATABASE_PORT", "5432")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "ai_agentic_db")
    SERVICE_NAME: str = "ai-agentic-service"
    SERVICE_VERSION: str = "1.0.0"
    SERVICE_PORT: int = int(os.getenv("SERVICE_PORT", "8008"))
    class Config:
        env_file = ".env"
    @property
    def database_url(self) -> str:
        return f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
settings = Settings()
