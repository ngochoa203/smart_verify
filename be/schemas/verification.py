from pydantic import BaseModel

class Verification(BaseModel):
    code: str