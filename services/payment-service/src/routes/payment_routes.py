from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from src.database import get_db
from src.models import Payment

router = APIRouter()

class PaymentCreate(BaseModel):
    order_id: int
    method: str
    paid_amount: int

class PaymentResponse(BaseModel):
    id: int
    order_id: int
    method: str
    transaction_id: Optional[str] = None
    paid_amount: int
    status: bool
    paid_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        orm_mode = True

@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "payment-service"}

@router.post("/payments", response_model=PaymentResponse)
async def create_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    # Validate payment method
    valid_methods = ["QR_VNPay", "Momo", "ZaloPay", "COD"]
    if payment.method not in valid_methods:
        raise HTTPException(status_code=400, detail=f"Invalid payment method. Must be one of: {', '.join(valid_methods)}")
    
    # Generate mock transaction ID
    import uuid
    transaction_id = f"TX-{uuid.uuid4().hex[:12].upper()}"
    
    # Create payment record
    db_payment = Payment(
        order_id=payment.order_id,
        method=payment.method,
        transaction_id=transaction_id,
        paid_amount=payment.paid_amount,
        status=payment.method != "COD",  # COD payments are not paid immediately
        paid_at=datetime.now() if payment.method != "COD" else None
    )
    
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    
    return db_payment

@router.get("/payments", response_model=List[PaymentResponse])
async def get_payments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    payments = db.query(Payment).offset(skip).limit(limit).all()
    return payments

@router.get("/payments/{payment_id}", response_model=PaymentResponse)
async def get_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return payment

@router.get("/payments/order/{order_id}", response_model=List[PaymentResponse])
async def get_order_payments(order_id: int, db: Session = Depends(get_db)):
    payments = db.query(Payment).filter(Payment.order_id == order_id).all()
    return payments

@router.put("/payments/{payment_id}/confirm")
async def confirm_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment.status:
        return {"message": "Payment already confirmed"}
    
    payment.status = True
    payment.paid_at = datetime.now()
    db.commit()
    db.refresh(payment)
    
    return {"message": "Payment confirmed successfully"}

@router.post("/payments/webhook")
async def payment_webhook(webhook_data: dict, db: Session = Depends(get_db)):
    """Handle payment gateway webhook notifications"""
    # In a real implementation, you would:
    # 1. Verify the webhook signature
    # 2. Parse the webhook data
    # 3. Update the payment status
    
    # Mock implementation
    transaction_id = webhook_data.get("transaction_id")
    status = webhook_data.get("status")
    
    if not transaction_id or status is None:
        raise HTTPException(status_code=400, detail="Invalid webhook data")
    
    payment = db.query(Payment).filter(Payment.transaction_id == transaction_id).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment.status = status == "success"
    if status == "success":
        payment.paid_at = datetime.now()
    
    db.commit()
    
    return {"message": "Webhook processed successfully"}