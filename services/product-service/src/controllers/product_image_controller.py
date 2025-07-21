from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import UploadFile
import logging
import asyncio

from src.models import ProductImage
from src.schemas.product_schemas import ProductImageCreate
from src.utils.s3_utils import upload_image_to_s3

class ProductImageController:
    @staticmethod
    def create_image(db: Session, product_id: int, image_data: ProductImageCreate) -> ProductImage:
        """Add a new product image URL"""
        db_image = ProductImage(**image_data.dict(), product_id=product_id)
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        return db_image
    
    @staticmethod
    async def upload_images(db: Session, product_id: int, images: List[UploadFile]) -> List[ProductImage]:
        """Upload multiple images for a product"""
        uploaded_images = []
        
        try:
            for image in images:
                try:
                    # Đảm bảo file được reset về đầu trước khi đọc
                    await image.seek(0)
                    
                    safe_filename = image.filename or "image.jpg"
                    content_type = image.content_type or "image/jpeg"
                    
                    # Upload ảnh lên S3
                    url = upload_image_to_s3(
                        image.file, 
                        safe_filename, 
                        content_type,
                        product_id=product_id
                    )
                    
                    # Lưu URL vào database
                    db_image = ProductImage(product_id=product_id, image_url=url)
                    db.add(db_image)
                    db.commit()
                    db.refresh(db_image)
                    uploaded_images.append(db_image)
                except Exception as e:
                    import logging
                    logging.error(f"Error uploading image {image.filename}: {str(e)}")
                    # Tiếp tục với ảnh tiếp theo nếu có lỗi
                    continue
        except Exception as e:
            import logging
            logging.error(f"Error in upload_images: {str(e)}")
            # Trả về danh sách ảnh đã upload được
        
        return uploaded_images
    
    @staticmethod
    def get_image(db: Session, image_id: int, product_id: int) -> Optional[ProductImage]:
        """Get image by ID and product ID"""
        return db.query(ProductImage).filter(
            ProductImage.id == image_id,
            ProductImage.product_id == product_id
        ).first()
    
    @staticmethod
    def delete_image(db: Session, db_image: ProductImage) -> None:
        """Delete product image"""
        db.delete(db_image)
        db.commit()