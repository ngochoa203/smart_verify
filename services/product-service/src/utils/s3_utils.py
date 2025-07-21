import boto3
import os
import logging
from uuid import uuid4

# Thiết lập logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lấy thông tin AWS từ biến môi trường
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-1")
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")

# Kiểm tra xem các biến môi trường có được thiết lập không
if not all([AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME]):
    logger.warning("AWS credentials or bucket name not set. S3 upload will not work.")
    # Sử dụng giá trị mặc định cho môi trường phát triển
    AWS_ACCESS_KEY_ID = AWS_ACCESS_KEY_ID or "dummy_key"
    AWS_SECRET_ACCESS_KEY = AWS_SECRET_ACCESS_KEY or "dummy_secret"
    AWS_S3_BUCKET_NAME = AWS_S3_BUCKET_NAME or "dummy_bucket"

try:
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION,
    )
    logger.info("S3 client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize S3 client: {e}")
    s3_client = None

from typing import Optional

def upload_image_to_s3(file_obj, filename: str, content_type: str, product_id: Optional[int] = None) -> str:
    """Upload file_obj to S3 and return the public URL"""
    try:
        # Xử lý tên file an toàn
        safe_filename = filename.replace(' ', '_')
        
        # Sử dụng product_id trong key nếu được cung cấp
        if product_id:
            key = f"products/{product_id}/{uuid4()}_{safe_filename}"
        else:
            key = f"products/{uuid4()}_{safe_filename}"
        
        logger.info(f"Uploading file {safe_filename} to S3 bucket {AWS_S3_BUCKET_NAME}")
        
        # Kiểm tra nếu s3_client không khởi tạo thành công
        if s3_client is None:
            logger.error("S3 client not initialized. Cannot upload file.")
            # Trả về URL giả lập cho môi trường phát triển
            return f"/mock-s3-url/{key}"
        
        # Upload file lên S3
        s3_client.upload_fileobj(
            file_obj,
            AWS_S3_BUCKET_NAME,
            key,
        )
        
        url = f"https://{AWS_S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{key}"
        logger.info(f"File uploaded successfully. URL: {url}")
        return url
    except Exception as e:
        logger.error(f"Error uploading file to S3: {e}")
        # Trả về URL giả lập trong trường hợp lỗi
        return f"/error-upload/{filename}"
