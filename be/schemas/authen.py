from pydantic import BaseModel

class Authen(BaseModel):
    username: str
    password: str
