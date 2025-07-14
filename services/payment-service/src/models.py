from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, CheckConstraint
from sqlalchemy.sql import func
from src.database import Base

class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = (
        CheckConstraint("method IN ('QR_VNPay', 'Momo', 'ZaloPay', 'COD')", name='check_payment_method'),
        {'schema': 'payment_service'}
    )
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=False, index=True)  # Reference to order-service
    method = Column(String(50), nullable=False)
    transaction_id = Column(Text, nullable=True)
    paid_amount = Column(Integer, nullable=True)
    status = Column(Boolean, default=False)  # TRUE: paid, FALSE: pending
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp())
