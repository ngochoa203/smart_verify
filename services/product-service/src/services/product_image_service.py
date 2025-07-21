from sqlalchemy.orm import Session
from typing import List
from fastapi import HTTPException, UploadFile

from src.controllers.product_controller import ProductController
from src.controllers.product_image_controller import ProductImageController
from src.models import ProductImage
from src.schemas.product_schemas import ProductImageCreate

class ProductImageService:
    @staticmethod
    def create_image(db: Session, product_id: int, image: ProductImageCreate) -> ProductImage:
        """Add a new product image URL"""
        # Check if product exists
        product = ProductController.get_product(db, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return ProductImageController.create_image(db, product_id, image)
    
    @staticmethod
    def upload_images(db: Session, product_id: int, images: List[UploadFile]) -> List[ProductImage]:
        """Upload multiple images for a product"""
        import asyncio
        # Check if product exists
        product = ProductController.get_product(db, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return asyncio.run(ProductImageController.upload_images(db, product_id, images))
    
    @staticmethod
    def delete_image(db: Session, product_id: int, image_id: int) -> dict:
        """Delete product image"""
        db_image = ProductImageController.get_image(db, image_id, product_id)
        if not db_image:
            raise HTTPException(status_code=404, detail="Product image not found")
        
        ProductImageController.delete_image(db, db_image)
        return {"message": "Product image deleted successfully"}