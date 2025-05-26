from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import auth, users, products

app = FastAPI(title="SmartVerify API", version="1.0")

app.mount("/res", StaticFiles(directory="res"), name="res")

# Set up CORS
allowed_origins = ['http://localhost:3000']
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1", tags=["Users"])
app.include_router(products.router, prefix="/api/v1", tags=["Products"])

@app.get("/")
async def read_root():
    return {"message": "Hello, FastAPI!"}
