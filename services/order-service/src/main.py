from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from src.database import engine
from src.models import Base
from src.routes.order_routes import router as order_router
from src.config import settings

# Create tables
Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="Order Service",
    description="Order management microservice for Smart Verify E-commerce",
    version=settings.SERVICE_VERSION
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(order_router, prefix="/api/v1")
@app.get("/")
async def root():
    return {
        "message": f"{settings.SERVICE_NAME} is running",
        "version": settings.SERVICE_VERSION,
        "docs": "/docs"
    }
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.SERVICE_PORT,
        reload=True
    )
