from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaymentBase(BaseModel):
    order_id: int
    method: str  # 'QR_VNPay', 'Momo', 'ZaloPay', 'COD'
    paid_amount: Optional[int] = None
    transaction_id: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    transaction_id: Optional[str] = None
    paid_amount: Optional[int] = None
    status: Optional[bool] = None
    paid_at: Optional[datetime] = None

class PaymentResponse(PaymentBase):
    id: int
    status: bool
    paid_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        orm_mode = True

class PaymentVerifyRequest(BaseModel):
    order_id: int
    transaction_id: str

class PaymentVerifyResponse(BaseModel):
    success: bool
    message: str
    payment_id: Optional[int] = None