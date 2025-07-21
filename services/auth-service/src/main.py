from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from src.database import engine
from src.routes.auth_routes import router as auth_router
from src.config import settings

# Create tables
app = FastAPI(
    title="Auth Service",
    description="Authentication and authorization microservice for Smart Verify E-commerce",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": f"{settings.SERVICE_NAME} is running",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=settings.SERVICE_PORT,
        reload=True
    )
