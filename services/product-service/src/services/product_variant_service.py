from sqlalchemy.orm import Session
from fastapi import HTTPException

from src.controllers.product_controller import ProductController
from src.controllers.product_variant_controller import ProductVariantController
from src.models import ProductVariant
from src.schemas.product_schemas import ProductVariantCreate, ProductVariantUpdate

class ProductVariantService:
    @staticmethod
    def create_variant(db: Session, product_id: int, variant: ProductVariantCreate) -> ProductVariant:
        """Create a new product variant"""
        # Check if product exists
        product = ProductController.get_product(db, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return ProductVariantController.create_variant(db, product_id, variant)
    
    @staticmethod
    def update_variant(
        db: Session, 
        product_id: int, 
        variant_id: int, 
        variant_update: ProductVariantUpdate
    ) -> ProductVariant:
        """Update product variant"""
        db_variant = ProductVariantController.get_variant(db, variant_id, product_id)
        if not db_variant:
            raise HTTPException(status_code=404, detail="Product variant not found")
        
        return ProductVariantController.update_variant(
            db, db_variant, variant_update.dict(exclude_unset=True)
        )
    
    @staticmethod
    def delete_variant(db: Session, product_id: int, variant_id: int) -> dict:
        """Delete product variant"""
        db_variant = ProductVariantController.get_variant(db, variant_id, product_id)
        if not db_variant:
            raise HTTPException(status_code=404, detail="Product variant not found")
        
        ProductVariantController.delete_variant(db, db_variant)
        return {"message": "Product variant deleted successfully"}