from sqlalchemy.orm import Session
from typing import Optional

from src.models import ProductVariant
from src.schemas.product_schemas import ProductVariantCreate, ProductVariantUpdate

class ProductVariantController:
    @staticmethod
    def create_variant(db: Session, product_id: int, variant_data: ProductVariantCreate) -> ProductVariant:
        """Create a new product variant"""
        db_variant = ProductVariant(**variant_data.dict(), product_id=product_id)
        db.add(db_variant)
        db.commit()
        db.refresh(db_variant)
        return db_variant
    
    @staticmethod
    def get_variant(db: Session, variant_id: int, product_id: int) -> Optional[ProductVariant]:
        """Get variant by ID and product ID"""
        return db.query(ProductVariant).filter(
            ProductVariant.id == variant_id,
            ProductVariant.product_id == product_id
        ).first()
    
    @staticmethod
    def update_variant(db: Session, db_variant: ProductVariant, variant_update: dict) -> ProductVariant:
        """Update product variant"""
        for field, value in variant_update.items():
            setattr(db_variant, field, value)
        
        db.commit()
        db.refresh(db_variant)
        return db_variant
    
    @staticmethod
    def delete_variant(db: Session, db_variant: ProductVariant) -> None:
        """Delete product variant"""
        db.delete(db_variant)
        db.commit()