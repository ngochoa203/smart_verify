from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db, engine
from src.models import Base, ProductUnit, OwnProduct
import uvicorn

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Service", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "Inventory Service is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "inventory-service"}

@app.get("/product-units")
async def get_product_units(db: Session = Depends(get_db)):
    units = db.query(ProductUnit).limit(10).all()
    return {"product_units": [{"id": u.id, "qr_code": u.qr_code, "is_used": u.is_used} for u in units]}

@app.post("/product-units")
async def create_product_unit(db: Session = Depends(get_db)):
    return {"message": "Product unit creation endpoint"}

@app.get("/product-units/verify/{qr_code}")
async def verify_qr_code(qr_code: str, db: Session = Depends(get_db)):
    unit = db.query(ProductUnit).filter(ProductUnit.qr_code == qr_code).first()
    if not unit:
        raise HTTPException(status_code=404, detail="QR code not found")
    
    return {
        "qr_code": unit.qr_code,
        "product_id": unit.product_id,
        "is_used": unit.is_used,
        "blockchain_hash": unit.blockchain_hash,
        "is_authentic": not unit.is_used  # Simple logic
    }

@app.get("/own-products")
async def get_own_products(db: Session = Depends(get_db)):
    products = db.query(OwnProduct).limit(10).all()
    return {"own_products": [{"id": p.id, "product_id": p.product_id, "owner_id": p.owner_id} for p in products]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
