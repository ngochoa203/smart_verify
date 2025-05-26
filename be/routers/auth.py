from typing import Optional, Union
from fastapi.security import OAuth2PasswordBearer
from fastapi import APIRouter, Depends, HTTPException, Response, status
import os
from dotenv import load_dotenv
from psycopg import AsyncConnection
from schemas.authen import AuthResponse, Authen
from schemas.users import UserCreate, UserResponse
from schemas.sellers import SellerCreate, SellerResponse
from models.database import get_connection
from models.public import login, register_user, register_seller
from models.helper import decode_access_token

load_dotenv()

router = APIRouter(tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

def get_current_user(token: str = Depends(oauth2_scheme)) -> Union[UserResponse, SellerResponse]:
    try:
        payload = decode_access_token(token)
        username: str = payload.get("sub")
        role: str = payload.get("role")
        user_id: int = payload.get("id")
        if not username or not role or not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
        return {"username": username, "role": role, "id": user_id}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

@router.get("/me")
async def read_current_user(current_user: dict = Depends(get_current_user)):
    return current_user

@router.post("/authen", response_model=AuthResponse)
async def login_route(infor: Authen, db = Depends(get_connection)):
    result = await login(db, infor)
    if isinstance(result, dict) and "error" in result:
        error_message = result["error"]
        if error_message == "Username does not exist":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error_message)
        elif error_message == "Incorrect password":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error_message)
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_message)
    return result
@router.post("/register/user", response_model= UserResponse)
async def register_user_route(user: UserCreate, db: AsyncConnection = Depends(get_connection)):
    response = await register_user(db, user)
    if response == 1:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")
    elif response == 3:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")
    return response

@router.post("/register/seller", response_model=SellerResponse)
async def register_seller_route(seller: SellerCreate, db: AsyncConnection = Depends(get_connection)):
    response = await register_seller(db, seller)
    if response == 1:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Seller already exists")
    elif response == 3:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")
    return response

@router.post('/logout')
def logout(response: Response):
    response.delete_cookie('access_token')
    return {"message": "Logged out successfully"}