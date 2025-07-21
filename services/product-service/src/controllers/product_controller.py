from sqlalchemy.orm import Session
from typing import List, Optional

from src.models import Product, ProductVariant, ProductImage
from src.schemas.product_schemas import ProductCreate, ProductUpdate

class ProductController:
    @staticmethod
    def create_product(db: Session, product_data: dict) -> Product:
        """Create a new product"""
        db_product = Product(**product_data)
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    
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
        query = db.query(Product)
        
        # Apply filters
        if category_id:
            query = query.filter(Product.category_id == category_id)
        if seller_id:
            query = query.filter(Product.seller_id == seller_id)
        if brand:
            query = query.filter(Product.brand == brand)
        if min_price:
            query = query.filter(Product.price >= min_price)
        if max_price:
            query = query.filter(Product.price <= max_price)
        if search:
            query = query.filter(Product.name.ilike(f"%{search}%"))
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_product(db: Session, product_id: int) -> Optional[Product]:
        """Get product by ID"""
        return db.query(Product).filter(Product.id == product_id).first()
    
    @staticmethod
    def update_product(db: Session, db_product: Product, product_update: dict) -> Product:
        """Update product"""
        for field, value in product_update.items():
            setattr(db_product, field, value)
        
        db.commit()
        db.refresh(db_product)
        return db_product
    
    @staticmethod
    def delete_product(db: Session, db_product: Product) -> None:
        """Delete product"""
        # Delete related variants and images
        db.query(ProductVariant).filter(ProductVariant.product_id == db_product.id).delete()
        db.query(ProductImage).filter(ProductImage.product_id == db_product.id).delete()
        
        db.delete(db_product)
        db.commit()
    
    @staticmethod
    def load_product_relations(db: Session, product: Product) -> Product:
        """Load variants and images for a product"""
        product.variants = db.query(ProductVariant).filter(
            ProductVariant.product_id == product.id
        ).all()
        product.images = db.query(ProductImage).filter(
            ProductImage.product_id == product.id
        ).all()
        return product