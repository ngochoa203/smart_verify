from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException, UploadFile
import logging
import asyncio

from src.controllers.product_controller import ProductController
from src.controllers.product_image_controller import ProductImageController
from src.models import Product, ProductImage
from src.schemas.product_schemas import ProductCreate, ProductUpdate, ProductResponse

class ProductService:
    @staticmethod
    async def create_product(
        db: Session, 
        name: str,
        description: str,
        brand: str,
        category_id: int,
        price: int,
        seller_id: int,
        images: List[UploadFile] = []
    ) -> Product:
        """Create a new product with images"""
        try:
            # Create product
            product_data = {
                "name": name,
                "description": description,
                "brand": brand,
                "category_id": category_id,
                "price": price,
                "seller_id": seller_id
            }
            
            db_product = ProductController.create_product(db, product_data)
            
            # Upload images if provided
            if images:
                try:
                    await ProductImageController.upload_images(db, getattr(db_product, "id"), images)
                except Exception as e:
                    import logging
                    logging.error(f"Error uploading images: {str(e)}")
                    # Tiếp tục với sản phẩm đã tạo, ngay cả khi upload ảnh thất bại
            
            # Load images for response
            return ProductController.load_product_relations(db, db_product)
        except Exception as e:
            import logging
            logging.error(f"Error in create_product: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error creating product: {str(e)}")
    
    @staticmethod
    def get_products(
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        category_id: Optional[int] = None,
        seller_id: Optional[int] = None,
        brand: Optional[str] = None,
        min_price: Optional[int] = None,
        max_price: Optional[int] = None,
        search: Optional[str] = None
    ) -> List[Product]:
        """Get all products with optional filters"""
        products = ProductController.get_products(
            db, skip, limit, category_id, seller_id, brand, min_price, max_price, search
        )
        
        # Load relations for each product
        for product in products:
            ProductController.load_product_relations(db, product)
        
        return products
    
    @staticmethod
    def get_product(db: Session, product_id: int) -> Product:
        """Get product by ID"""
        product = ProductController.get_product(db, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return ProductController.load_product_relations(db, product)
    
    @staticmethod
    def update_product(db: Session, product_id: int, product_update: ProductUpdate) -> Product:
        """Update product"""
        db_product = ProductController.get_product(db, product_id)
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        updated_product = ProductController.update_product(
            db, db_product, product_update.dict(exclude_unset=True)
        )
        
        return ProductController.load_product_relations(db, updated_product)
    
    @staticmethod
    def delete_product(db: Session, product_id: int) -> dict:
        """Delete product"""
        db_product = ProductController.get_product(db, product_id)
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        ProductController.delete_product(db, db_product)
        return {"message": "Product deleted successfully"}