import json
import os
from typing import List
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from psycopg import AsyncConnection
from models.products import add_product, get_all_products, get_product_by_id, get_products_by_seller, get_products_by_user, delete_product
from schemas.products import Product, ProductVariantCreate
from models.database import get_connection
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(tags=["Products"])

@router.post("/products/add")
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    brand: str = Form(...),
    category_id: int = Form(...),
    price: int = Form(...),
    is_seller: bool = Form(...),
    owner_id: int = Form(...),
    variants: List[str] = Form(...),
    images: List[UploadFile] = File([]),
    db: AsyncConnection = Depends(get_connection)
):
    try:
        parsed_variants = [ProductVariantCreate(**json.loads(v)) for v in variants]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid variant format: {str(e)}")
    image_list = [await img.read() for img in images]

    product_data = {
        "name": name,
        "description": description,
        "brand": brand,
        "category_id": category_id,
        "price": price,
    }

    result = await add_product(
        db=db,
        product_data=product_data,
        is_seller=is_seller,
        owner_id=owner_id,
        images=image_list,
        variants=parsed_variants
    )
    return result

@router.get("/products", response_model=List[Product])
async def get_all(db: AsyncConnection = Depends(get_connection)):
    products = await get_all_products(db)
    if not products:
        return []
    return products

@router.get("/products/{product_id}", response_model=Product)
async def get_product_detail(product_id: int, db: AsyncConnection = Depends(get_connection)):
    product = await get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/products/seller/{seller_id}", response_model=List[Product])
async def get_product_by_seller_id(seller_id: int, db: AsyncConnection = Depends(get_connection)):
    product = await get_products_by_seller(db, seller_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/products/user/{user_id}", response_model=List[Product])
async def get_product_by_user_id(user_id: int, db: AsyncConnection = Depends(get_connection)):
    product = await get_products_by_user(db, user_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/product/delete/{product_id}")
async def delete_product_by_id(product_id: int, db: AsyncConnection = Depends(get_connection)):
    product = await delete_product(db, product_id)
    if not product:
        raise HTTPException(status_code=401, detail="Error or not found")
    return {"message":"Delete Successful!"}