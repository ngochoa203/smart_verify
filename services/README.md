# 🛍️ Smart Verify E-commerce - Microservices Architecture

Hệ thống thương mại điện tử sử dụng kiến trúc microservice với AI để xác thực sản phẩm.

## 🏗️ Kiến trúc hệ thống

### Microservices
- **User Service** (Port 8001): Quản lý người dùng và người bán
- **Product Service** (Port 8002): Quản lý sản phẩm, danh mục, QR codes
- **Review Service** (Port 8003): Đánh giá và yêu thích sản phẩm
- **Order Service** (Port 8004): Đơn hàng và thanh toán
- **AI Risk Service** (Port 8005): Phân tích rủi ro giả mạo sản phẩm

### Databases
Mỗi service có PostgreSQL database riêng:
- `user_db` (Port 5432)
- `product_db` (Port 5433)  
- `review_db` (Port 5434)
- `order_db` (Port 5435)
- `ai_risk_db` (Port 5436)

### AI/ML Components
- **MindsDB** (Port 47334): Machine Learning platform
- **Product Authenticity Model**: Dự đoán sản phẩm giả mạo

## 🚀 Cài đặt và chạy

### Yêu cầu
- Docker & Docker Compose
- Python 3.11+
- Git

### Chạy hệ thống

```bash
# Clone repository
git clone <your-repo>
cd smart_verify/backend

# Cấp quyền thực thi cho script quản lý
chmod +x manage.sh

# Chạy setup đầy đủ (build + start + seed data)
./manage.sh full

# Hoặc chạy từng bước
./manage.sh build    # Build tất cả services
./manage.sh setup    # Setup databases
./manage.sh start    # Start services
./manage.sh seed     # Seed sample data
```

### Menu tương tác
```bash
./manage.sh
```

## 📊 Database Schema

### User Service
```sql
-- Schema: user_service
users (id, username, email, password, phone, address, avatar_url, is_active, created_at)
sellers (id, username, email, password, phone, shop_name, shop_description, logo_url, is_verified, created_at)
```

### Product Service  
```sql
-- Schema: product_service
categories (id, name, parent_id, created_at)
products (id, seller_id, name, description, brand, category_id, price, created_at)
product_variants (id, product_id, size, color, quantity, price, created_at)
product_images (id, product_id, image_url, uploaded_at)
product_qr (id, product_id, variant_id, qr_code, blockchain_hash, is_used, used_at, created_at)
```

### Review Service
```sql
-- Schema: review_service  
reviews (id, user_id, product_id, content, rating, sentiment, created_at)
favorites (id, user_id, product_id, created_at)
```

### Order Service
```sql
-- Schema: order_service
orders (id, user_id, total_amount, status, blockchain_hash, created_at)
order_items (id, order_id, product_id, variant_id, quantity, price, created_at)
payments (id, order_id, method, transaction_id, paid_amount, status, paid_at, created_at)
```

### AI Risk Service
```sql
-- Schema: ai_risk_service
ai_risk_scores (id, product_id, risk_score, confidence, features_used, model_version, prediction_date)
product_authenticity_data (id, product_id, brand, price, avg_rating, review_count, has_qr_code, is_authentic)
mindsdb_models (id, model_name, model_status, accuracy, training_data_count, created_at)
```

## 🤖 AI Integration với MindsDB

### Model Training
```sql
-- Tạo connection đến database
CREATE DATABASE ecommerce_data
WITH ENGINE = "postgres",
PARAMETERS = {
    "host": "localhost",
    "port": "5436", 
    "database": "ai_risk_db"
}

-- Tạo model dự đoán
CREATE MODEL product_authenticity_predictor
FROM ecommerce_data
(SELECT * FROM ai_risk_service.product_authenticity_data WHERE is_authentic IS NOT NULL)
PREDICT is_authentic
USING engine = 'lightgbm'
```

### Prediction Usage
```sql
-- Dự đoán sản phẩm giả
SELECT is_authentic, is_authentic_confidence
FROM mindsdb.product_authenticity_predictor  
WHERE brand = 'Louis Vuitton'
AND price = 15000000
AND avg_rating = 4.2
```

## 🧪 Sample Data

Hệ thống tự động tạo dữ liệu mẫu:
- ✅ 5 users
- ✅ 2 sellers  
- ✅ 10 products (iPhone, Samsung, MacBook, Nike, Louis Vuitton...)
- ✅ QR codes + blockchain hashes
- ✅ 30 reviews (3 per product)
- ✅ 2 products có risk_score > 0.7

## 🌐 API Endpoints

### Health Checks
- `GET /health` - Tất cả services

### User Service
- `GET /users` - Danh sách users
- `POST /users` - Tạo user mới

### Product Service  
- `GET /products` - Danh sách sản phẩm
- `POST /products` - Tạo sản phẩm
- `GET /products/{id}/risk-score` - Điểm rủi ro sản phẩm

### Review Service
- `GET /reviews` - Danh sách đánh giá
- `POST /reviews` - Tạo đánh giá mới

### Order Service
- `GET /orders` - Danh sách đơn hàng
- `POST /orders` - Tạo đơn hàng

### AI Risk Service
- `GET /risk-scores/{product_id}` - Điểm rủi ro sản phẩm
- `POST /predict` - Dự đoán rủi ro mới

## 🔧 Development

### Adding New Service
1. Tạo thư mục service mới trong `backend/`
2. Copy structure từ service existing
3. Update `docker-compose.yml`
4. Update `manage.sh`

### Database Migration
```bash
cd backend/{service-name}
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

### Monitoring Logs
```bash
./manage.sh logs

# Hoặc specific service
docker-compose logs -f user-service
```

## 🛡️ Security Features

- ✅ Password hashing
- ✅ Schema isolation per service  
- ✅ No direct foreign keys between services
- ✅ Blockchain hash for QR codes
- ✅ AI-powered fraud detection

## 📈 Monitoring & Health

```bash
# Check all services health
./manage.sh health

# View service URLs
./manage.sh urls
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test với `./manage.sh full`
5. Submit pull request

## 📝 License

MIT License - see LICENSE file for details

---

**🎉 Enjoy building with Smart Verify E-commerce!**
