from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PaymentBase(BaseModel):
    order_id: int
    method: str
    transaction_id: Optional[str] = None
    paid_amount: Optional[int] = None

class PaymentCreate(BaseModel):
    order_id: int
    method: str

class PaymentUpdate(BaseModel):
    status: Optional[bool] = None
    transaction_id: Optional[str] = None
    paid_at: datetime

class PaymentResponse(PaymentBase):
    id: int
    status: bool
    paid_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
