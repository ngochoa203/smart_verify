from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PaymentBase(BaseModel):
    order_id: int
    method: str
    transaction_id: Optional[str] = None
    paid_amount: Optional[int] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    status: Optional[bool] = None
    transaction_id: Optional[str] = None
    paid_at: Optional[datetime] = None

class PaymentResponse(PaymentBase):
    id: int
    status: bool
    paid_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
