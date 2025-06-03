
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Admin"])

class AdminLogin(BaseModel):
    username: str
    password: str
    
