from sqlalchemy.orm import Session
from typing import List, Optional

from src.models import Category
from src.schemas.product_schemas import CategoryCreate, CategoryUpdate

class CategoryController:
    @staticmethod
    def create_category(db: Session, category_data: CategoryCreate) -> Category:
        """Create a new category"""
        db_category = Category(**category_data.dict())
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category
    
    @staticmethod
    def get_categories(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
        """Get all categories"""
        return db.query(Category).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_category(db: Session, category_id: int) -> Optional[Category]:
        """Get category by ID"""
        return db.query(Category).filter(Category.id == category_id).first()
    
    @staticmethod
    def update_category(db: Session, db_category: Category, category_update: dict) -> Category:
        """Update category"""
        for field, value in category_update.items():
            setattr(db_category, field, value)
        
        db.commit()
        db.refresh(db_category)
        return db_category
    
    @staticmethod
    def delete_category(db: Session, db_category: Category) -> None:
        """Delete category"""
        db.delete(db_category)
        db.commit()