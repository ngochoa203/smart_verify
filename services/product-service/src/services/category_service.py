from sqlalchemy.orm import Session
from typing import List
from fastapi import HTTPException

from src.controllers.category_controller import CategoryController
from src.models import Category
from src.schemas.product_schemas import CategoryCreate, CategoryUpdate

class CategoryService:
    @staticmethod
    def create_category(db: Session, category: CategoryCreate) -> Category:
        """Create a new category"""
        return CategoryController.create_category(db, category)
    
    @staticmethod
    def get_categories(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
        """Get all categories"""
        return CategoryController.get_categories(db, skip, limit)
    
    @staticmethod
    def get_category(db: Session, category_id: int) -> Category:
        """Get category by ID"""
        category = CategoryController.get_category(db, category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return category
    
    @staticmethod
    def update_category(db: Session, category_id: int, category_update: CategoryUpdate) -> Category:
        """Update category"""
        db_category = CategoryController.get_category(db, category_id)
        if not db_category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        return CategoryController.update_category(
            db, db_category, category_update.dict(exclude_unset=True)
        )
    
    @staticmethod
    def delete_category(db: Session, category_id: int) -> dict:
        """Delete category"""
        db_category = CategoryController.get_category(db, category_id)
        if not db_category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        CategoryController.delete_category(db, db_category)
        return {"message": "Category deleted successfully"}