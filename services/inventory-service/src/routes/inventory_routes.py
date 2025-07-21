from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import hashlib
import uuid
import qrcode
import io
import base64
from datetime import datetime

from src.database import get_db
from src.models import ProductUnit, OwnProduct
from src.schemas.inventory_schemas import (
    ProductUnitCreate, ProductUnitResponse,
    OwnProductCreate, OwnProductResponse,
    QRVerifyRequest, QRVerifyResponse
)

router = APIRouter()

# Health check
@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "inventory-service"}

# Helper function to generate blockchain hash
def generate_blockchain_hash(product_id: int, variant_id: Optional[int] = None) -> str:
    """Generate a blockchain-like hash for product verification"""
    data = f"{product_id}_{variant_id}_{uuid.uuid4()}_{datetime.utcnow().timestamp()}"
    return hashlib.sha256(data.encode()).hexdigest()

# Helper function to generate QR code
def generate_qr_code(product_id: int, variant_id: Optional[int] = None) -> str:
    """Generate a QR code string for a product"""
    base = f"PRODUCT_{product_id}"
    if variant_id:
        base += f"_VARIANT_{variant_id}"
    return f"{base}_{uuid.uuid4().hex[:8].upper()}"

# Helper function to create QR code image
def create_qr_code_image(qr_code: str) -> str:
    """Create a QR code image and return as base64"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_code)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer)
    return base64.b64encode(buffer.getvalue()).decode()

# Product unit endpoints
@router.post("/product-units", response_model=ProductUnitResponse)
async def create_product_unit(unit: ProductUnitCreate, db: Session = Depends(get_db)):
    """Create a new product unit with QR code"""
    db_unit = ProductUnit(
        product_id=unit.product_id,
        variant_id=unit.variant_id,
        qr_code=unit.qr_code,
        blockchain_hash=unit.blockchain_hash
    )
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    return db_unit

@router.post("/product-units/generate", response_model=ProductUnitResponse)
async def generate_product_unit(
    product_id: int,
    variant_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Generate a new product unit with QR code and blockchain hash"""
    # Generate QR code and blockchain hash
    qr_code = generate_qr_code(product_id, variant_id)
    blockchain_hash = generate_blockchain_hash(product_id, variant_id)
    
    # Create product unit
    db_unit = ProductUnit(
        product_id=product_id,
        variant_id=variant_id,
        qr_code=qr_code,
        blockchain_hash=blockchain_hash
    )
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    return db_unit

@router.get("/product-units", response_model=List[ProductUnitResponse])
async def get_product_units(
    product_id: Optional[int] = None,
    variant_id: Optional[int] = None,
    is_used: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all product units with optional filters"""
    query = db.query(ProductUnit)
    
    # Apply filters
    if product_id:
        query = query.filter(ProductUnit.product_id == product_id)
    if variant_id:
        query = query.filter(ProductUnit.variant_id == variant_id)
    if is_used is not None:
        query = query.filter(ProductUnit.is_used == is_used)
    
    units = query.offset(skip).limit(limit).all()
    return units

@router.get("/product-units/{unit_id}", response_model=ProductUnitResponse)
async def get_product_unit(unit_id: int, db: Session = Depends(get_db)):
    """Get product unit by ID"""
    unit = db.query(ProductUnit).filter(ProductUnit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Product unit not found")
    return unit

@router.post("/product-units/verify", response_model=QRVerifyResponse)
async def verify_qr_code(verify_request: QRVerifyRequest, db: Session = Depends(get_db)):
    """Verify a QR code"""
    unit = db.query(ProductUnit).filter(ProductUnit.qr_code == verify_request.qr_code).first()
    
    if not unit:
        return QRVerifyResponse(
            is_valid=False,
            message="Invalid QR code"
        )
    
    return QRVerifyResponse(
        is_valid=True,
        product_id=unit.product_id,
        variant_id=unit.variant_id,
        is_used=unit.is_used,
        blockchain_hash=unit.blockchain_hash,
        message="QR code verified successfully"
    )

@router.post("/product-units/{unit_id}/use")
async def mark_unit_as_used(unit_id: int, db: Session = Depends(get_db)):
    """Mark a product unit as used"""
    unit = db.query(ProductUnit).filter(ProductUnit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Product unit not found")
    
    if unit.is_used:
        return {"message": "Product unit already marked as used"}
    
    unit.is_used = True
    unit.used_at = datetime.utcnow()
    db.commit()
    db.refresh(unit)
    
    return {"message": "Product unit marked as used"}

@router.get("/product-units/{unit_id}/qr-image")
async def get_qr_code_image(unit_id: int, db: Session = Depends(get_db)):
    """Get QR code image for a product unit"""
    unit = db.query(ProductUnit).filter(ProductUnit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Product unit not found")
    
    qr_image = create_qr_code_image(unit.qr_code)
    
    return {
        "qr_code": unit.qr_code,
        "qr_image": qr_image
    }

# Own product endpoints
@router.post("/own-products", response_model=OwnProductResponse)
async def create_own_product(own_product: OwnProductCreate, db: Session = Depends(get_db)):
    """Register product ownership"""
    db_own = OwnProduct(
        product_id=own_product.product_id,
        is_seller=own_product.is_seller,
        owner_id=own_product.owner_id
    )
    db.add(db_own)
    db.commit()
    db.refresh(db_own)
    return db_own

@router.get("/own-products/owner/{owner_id}", response_model=List[OwnProductResponse])
async def get_owner_products(
    owner_id: int,
    is_seller: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get all products owned by a user or seller"""
    query = db.query(OwnProduct).filter(OwnProduct.owner_id == owner_id)
    
    if is_seller is not None:
        query = query.filter(OwnProduct.is_seller == is_seller)
    
    own_products = query.all()
    return own_products

@router.get("/own-products/product/{product_id}", response_model=List[OwnProductResponse])
async def get_product_owners(product_id: int, db: Session = Depends(get_db)):
    """Get all owners of a product"""
    own_products = db.query(OwnProduct).filter(OwnProduct.product_id == product_id).all()
    return own_products

@router.delete("/own-products/{own_id}")
async def delete_own_product(own_id: int, db: Session = Depends(get_db)):
    """Delete product ownership"""
    db_own = db.query(OwnProduct).filter(OwnProduct.id == own_id).first()
    if not db_own:
        raise HTTPException(status_code=404, detail="Ownership record not found")
    
    db.delete(db_own)
    db.commit()
    return {"message": "Ownership record deleted successfully"}