from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from src.database import engine
from src.models import Base
from src.routes.inventory_routes import router as inventory_router
from src.config import settings

# Create tables
Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="Inventory Service",
    description="Inventory management microservice for Smart Verify E-commerce",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(inventory_router, prefix="/api/v1")
@app.get("/")
async def root():
    return {
        "message": "Inventory Service is running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "inventory-service"}

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8003,
        reload=True
    )
