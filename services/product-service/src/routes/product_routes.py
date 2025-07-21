from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from src.database import get_db
from src.models import Product, ProductVariant, ProductImage, Category
from src.utils.s3_utils import upload_image_to_s3
from src.schemas.product_schemas import (
    ProductCreate, ProductUpdate, ProductResponse,
    ProductVariantCreate, ProductVariantUpdate, ProductVariantResponse,
    ProductImageCreate, ProductImageResponse,
    CategoryCreate, CategoryUpdate, CategoryResponse
)
from src.services.product_service import ProductService
from src.services.category_service import CategoryService
from src.services.product_variant_service import ProductVariantService
from src.services.product_image_service import ProductImageService

router = APIRouter()

# Health check
@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "product-service"}

# Category endpoints
@router.post("/categories", response_model=CategoryResponse)
async def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category"""
    return CategoryService.create_category(db, category)

@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all categories"""
    return CategoryService.get_categories(db, skip, limit)

@router.get("/categories/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get category by ID"""
    return CategoryService.get_category(db, category_id)

@router.put("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int, 
    category_update: CategoryUpdate, 
    db: Session = Depends(get_db)
):
    """Update category"""
    return CategoryService.update_category(db, category_id, category_update)

@router.delete("/categories/{category_id}")
async def delete_category(category_id: int, db: Session = Depends(get_db)):
    """Delete category"""
    return CategoryService.delete_category(db, category_id)

# Product endpoints
@router.post("/products", response_model=ProductResponse)
async def create_product(
    name: str = Form(...),
    description: str = Form(None),
    brand: str = Form(None),
    category_id: int = Form(...),
    price: int = Form(...),
    seller_id: int = Form(...),
    images: list[UploadFile] = File([]),
    db: Session = Depends(get_db)
):
    """Create a new product with image upload"""
    return await ProductService.create_product(
        db, name, description, brand, category_id, price, seller_id, images
    )

@router.get("/products", response_model=List[ProductResponse])
async def get_products(
    skip: int = 0, 
    limit: int = 100, 
    category_id: Optional[int] = None,
    seller_id: Optional[int] = None,
    brand: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all products with optional filters"""
    return ProductService.get_products(
        db, skip, limit, category_id, seller_id, brand, min_price, max_price, search
    )

@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get product by ID"""
    return ProductService.get_product(db, product_id)

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int, 
    product_update: ProductUpdate, 
    db: Session = Depends(get_db)
):
    """Update product"""
    return await ProductService.update_product(db, product_id, product_update)

@router.delete("/products/{product_id}")
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete product"""
    return ProductService.delete_product(db, product_id)

# Product variant endpoints
@router.post("/products/{product_id}/variants", response_model=ProductVariantResponse)
async def create_product_variant(
    product_id: int,
    variant: ProductVariantCreate,
    db: Session = Depends(get_db)
):
    """Create a new product variant"""
    return await ProductVariantService.create_variant(db, product_id, variant)

@router.put("/products/{product_id}/variants/{variant_id}", response_model=ProductVariantResponse)
async def update_product_variant(
    product_id: int,
    variant_id: int,
    variant_update: ProductVariantUpdate,
    db: Session = Depends(get_db)
):
    """Update product variant"""
    return await ProductVariantService.update_variant(db, product_id, variant_id, variant_update)

@router.delete("/products/{product_id}/variants/{variant_id}")
async def delete_product_variant(
    product_id: int,
    variant_id: int,
    db: Session = Depends(get_db)
):
    """Delete product variant"""
    return ProductVariantService.delete_variant(db, product_id, variant_id)

# Product image endpoints
@router.post("/products/{product_id}/images", response_model=ProductImageResponse)
async def create_product_image(
    product_id: int,
    image: ProductImageCreate,
    db: Session = Depends(get_db)
):
    """Add a new product image URL"""
    return await ProductImageService.create_image(db, product_id, image)

@router.post("/products/{product_id}/upload-images", response_model=List[ProductImageResponse])
async def upload_product_images(
    product_id: int,
    images: list[UploadFile] = File([]),
    db: Session = Depends(get_db)
):
    """Upload multiple images for an existing product"""
    return ProductImageService.upload_images(db, product_id, images)

@router.delete("/products/{product_id}/images/{image_id}")
async def delete_product_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db)
):
    """Delete product image"""
    return ProductImageService.delete_image(db, product_id, image_id)