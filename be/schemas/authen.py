from typing import Union
from pydantic import BaseModel

from schemas.sellers import SellerResponse
from schemas.users import UserResponse

class Authen(BaseModel):
    username: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: Union[UserResponse, SellerResponse]
    role: str