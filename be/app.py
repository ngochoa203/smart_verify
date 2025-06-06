from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import auth, users, products, comments, favorite, order, category, admin
from contextlib import asynccontextmanager
from models.database import open_pool, close_pool

@asynccontextmanager
async def lifespan(app: FastAPI):
    await open_pool()
    yield 
    await close_pool()

app = FastAPI(title="SmartVerify API", version="1.0", lifespan=lifespan)

app.mount("/res", StaticFiles(directory="res"), name="res")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1", tags=["Users"])
app.include_router(products.router, prefix="/api/v1", tags=["Products"])
app.include_router(comments.router, prefix="/api/v1", tags=["Comments"])
app.include_router(favorite.router, prefix="/api/v1", tags=["Favorite"])
app.include_router(order.router, prefix="/api/v1", tags=["Orders"])
app.include_router(category.router, prefix="/api/v1", tags=["Categories"])
app.include_router(admin.router, prefix="/api/v1", tags=["Admin"])

@app.get("/")
async def read_root():
    return {"message": "Hello, FastAPI!"}