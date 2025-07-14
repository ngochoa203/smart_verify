# 🏗️ Smart Verify E-commerce - Microservices Architecture Summary

## 📋 Service Overview

| Service              | Port | Database Port | Chức năng chính                                                            |
| -------------------- | ---- | ------------- | -------------------------------------------------------------------------- |
| `auth-service`       | 8001 | 5432          | Đăng ký, đăng nhập, JWT, quản lý `users`, `sellers`, `admins`              |
| `product-service`    | 8002 | 5433          | Quản lý `products`, `product_variants`, `product_images`, `categories`     |
| `inventory-service`  | 8003 | 5437          | Quản lý `product_units`, `own_products`, xác minh QR code + blockchain     |
| `order-service`      | 8004 | 5435          | Quản lý đơn hàng `orders`, `order_items`, tính tổng giá, trạng thái        |
| `payment-service`    | 8005 | 5438          | Thanh toán đơn hàng, lưu `payments`, tích hợp QR VNPay, MoMo, ZaloPay      |
| `review-service`     | 8006 | 5434          | Quản lý đánh giá, bình luận `comments`, phân tích cảm xúc                  |
| `favorite-service`   | 8007 | 5439          | Quản lý danh sách yêu thích `favorites`                                    |
| `ai-agentic-service` | 8008 | 5436          | Giao tiếp MindsDB, dự đoán `sentiment`, `fake_score`, sinh cảnh báo AI     |

## 🗃️ Database Schema Distribution

### Auth Service (`auth_service` schema)
```sql
users (id, username, email, password, phone, address, avatar_url, is_active, created_at)
sellers (id, username, email, password, phone, shop_name, shop_description, logo_url, is_verified, created_at)
admins (id, username, password, created_at)
```

### Product Service (`product_service` schema)
```sql
categories (id, name, parent_id)
products (id, seller_id, user_id, name, description, brand, category_id, price, created_at)
product_variants (id, product_id, size, color, quantity, price, created_at)
product_images (id, product_id, image_url, uploaded_at)
```

### Inventory Service (`inventory_service` schema)
```sql
product_units (id, product_id, variant_id, qr_code, blockchain_hash, is_used, used_at, created_at)
own_products (id, product_id, is_seller, owner_id, created_at)
```

### Order Service (`order_service` schema)
```sql
orders (id, user_id, total_amount, status, blockchain_hash, created_at)
order_items (id, order_id, product_id, variant_id, quantity, price)
```

### Payment Service (`payment_service` schema)
```sql
payments (id, order_id, method, transaction_id, paid_amount, status, paid_at, created_at)
```

### Review Service (`review_service` schema)
```sql
comments (id, user_id, product_id, content, sentiment, created_at)
```

### Favorite Service (`favorite_service` schema)
```sql
favorites (id, user_id, product_id, created_at)
```

### AI Agentic Service (`ai_agentic_service` schema)
```sql
ai_risk_scores (id, product_id, risk_score, confidence, features_used, model_version, prediction_date, created_at)
sentiment_analysis (id, comment_id, content, sentiment_score, sentiment_label, confidence, model_used, created_at)
product_authenticity_data (id, product_id, seller_id, brand, price, category_id, has_qr_code, qr_scan_count, blockchain_verified, comment_count, avg_sentiment, is_authentic, risk_level, last_updated, created_at)
mindsdb_models (id, model_name, model_type, model_status, accuracy, training_data_count, created_at, updated_at)
```

## 🔄 Service Communication Flow

### 1. User Registration/Authentication
```
Frontend → Auth Service → Database
```

### 2. Product Creation
```
Frontend → Product Service → Database
         → Inventory Service (create QR codes)
```

### 3. Order Processing
```
Frontend → Order Service → Database
         → Payment Service (process payment)
         → Inventory Service (update units)
```

### 4. Review & AI Analysis
```
Frontend → Review Service → Database
         → AI Agentic Service (sentiment analysis)
         → MindsDB (ML processing)
```

### 5. Product Authenticity Check
```
Frontend → Product Service (get product info)
         → Inventory Service (check QR/blockchain)
         → AI Agentic Service (risk prediction)
         → MindsDB (authenticity model)
```

## 🚀 Quick Start Commands

```bash
# Start all services
cd backend
./manage.sh full

# Individual operations
./manage.sh build    # Build all services
./manage.sh start    # Start all services
./manage.sh stop     # Stop all services
./manage.sh health   # Check service health
./manage.sh urls     # Show service URLs
```

## 🔗 Inter-Service References

Services communicate via HTTP APIs and reference each other using IDs:

- **Auth Service**: Provides user_id, seller_id, admin_id to other services
- **Product Service**: Provides product_id, category_id, variant_id
- **Inventory Service**: References product_id, manages QR codes
- **Order Service**: References user_id, product_id, variant_id
- **Payment Service**: References order_id from Order Service
- **Review Service**: References user_id, product_id
- **Favorite Service**: References user_id, product_id
- **AI Agentic Service**: Aggregates data from all services for ML

## 🤖 AI/ML Integration

### MindsDB Models
1. **Sentiment Analysis Model**: Analyzes comment sentiment
2. **Product Authenticity Model**: Predicts fake products
3. **Risk Scoring Model**: Calculates product risk scores

### Data Flow to MindsDB
```
Product Data + QR Data + Comment Data → AI Agentic Service → MindsDB → Predictions
```

## 📊 Monitoring & Health Checks

Each service exposes:
- `GET /health` - Service health status
- `GET /` - Service information
- Service-specific endpoints

## 🛡️ Security Features

- JWT-based authentication in Auth Service
- Schema isolation per service
- No direct foreign keys between services
- Blockchain verification for QR codes
- AI-powered fraud detection

---

**✅ All services are independently deployable and scalable!**
