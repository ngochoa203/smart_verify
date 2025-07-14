#!/usr/bin/env python3
"""
Seed data script for Smart Verify E-commerce system
Tạo dữ liệu mẫu cho tất cả các service
"""
import asyncio
import random
import hashlib
import uuid
from datetime import datetime, timedelta
from typing import List

# Mock data để tạo seed
USERS_DATA = [
    {"username": "john_doe", "email": "john@example.com", "phone": "0901234567", "address": "123 Le Loi, District 1, Ho Chi Minh City"},
    {"username": "jane_smith", "email": "jane@example.com", "phone": "0907654321", "address": "456 Nguyen Hue, District 1, Ho Chi Minh City"},
    {"username": "bob_wilson", "email": "bob@example.com", "phone": "0903456789", "address": "789 Dong Khoi, District 1, Ho Chi Minh City"},
    {"username": "alice_brown", "email": "alice@example.com", "phone": "0909876543", "address": "321 Bach Dang, District 1, Ho Chi Minh City"},
    {"username": "charlie_davis", "email": "charlie@example.com", "phone": "0905432167", "address": "654 Ham Nghi, District 1, Ho Chi Minh City"},
]

SELLERS_DATA = [
    {
        "username": "techstore_vn", 
        "email": "tech@store.vn", 
        "phone": "0281234567",
        "shop_name": "TechStore Vietnam",
        "shop_description": "Chuyên cung cấp thiết bị công nghệ chính hãng",
        "is_verified": True
    },
    {
        "username": "fashion_hub", 
        "email": "fashion@hub.vn", 
        "phone": "0287654321",
        "shop_name": "Fashion Hub",
        "shop_description": "Thời trang cao cấp từ các thương hiệu nổi tiếng",
        "is_verified": True
    }
]

PRODUCTS_DATA = [
    {"name": "iPhone 15 Pro Max", "brand": "Apple", "price": 29990000, "description": "Flagship smartphone from Apple"},
    {"name": "Samsung Galaxy S24 Ultra", "brand": "Samsung", "price": 26990000, "description": "Premium Android smartphone"},
    {"name": "MacBook Pro M3", "brand": "Apple", "price": 45990000, "description": "Professional laptop with M3 chip"},
    {"name": "Dell XPS 13", "brand": "Dell", "price": 25990000, "description": "Ultra-thin business laptop"},
    {"name": "Nike Air Jordan 1", "brand": "Nike", "price": 4500000, "description": "Classic basketball sneakers"},
    {"name": "Adidas Ultraboost 23", "brand": "Adidas", "price": 3800000, "description": "Running shoes with boost technology"},
    {"name": "Louis Vuitton Neverfull", "brand": "Louis Vuitton", "price": 35000000, "description": "Luxury handbag"},
    {"name": "Rolex Submariner", "brand": "Rolex", "price": 250000000, "description": "Luxury diving watch"},
    {"name": "Sony WH-1000XM5", "brand": "Sony", "price": 8500000, "description": "Noise-canceling headphones"},
    {"name": "Dyson V15 Detect", "brand": "Dyson", "price": 18500000, "description": "Cordless vacuum cleaner"},
]

REVIEW_CONTENTS = [
    "Sản phẩm rất tốt, chất lượng như mô tả!",
    "Giao hàng nhanh, đóng gói cẩn thận",
    "Giá hơi đắt nhưng chất lượng xứng đáng",
    "Sản phẩm chính hãng, mình rất hài lòng",
    "Shop phục vụ tốt, sẽ ủng hộ lần sau",
    "Chất lượng tạm được, giá hợp lý",
    "Sản phẩm đúng như hình, rất đẹp",
    "Giao hàng hơi chậm nhưng sản phẩm ok",
    "Chất lượng tốt, đáng tiền",
    "Sản phẩm có vẻ hơi khác so với mô tả",
]

class DatabaseSeeder:
    def __init__(self):
        self.users = []
        self.sellers = []
        self.products = []
        self.reviews = []
        
    def generate_hash(self, data: str) -> str:
        """Generate blockchain-like hash"""
        return hashlib.sha256(f"{data}_{uuid.uuid4()}".encode()).hexdigest()
    
    def generate_qr_code(self, product_id: int, variant_id: int = None) -> str:
        """Generate QR code string"""
        base = f"PRODUCT_{product_id}"
        if variant_id:
            base += f"_VARIANT_{variant_id}"
        return f"{base}_{uuid.uuid4().hex[:8].upper()}"
    
    async def seed_users(self):
        """Seed users table"""
        print("🧑‍💼 Seeding users...")
        
        # In production, you would use actual database connections
        # For demo, we'll create the data structure
        
        for i, user_data in enumerate(USERS_DATA):
            user = {
                "id": i + 1,
                "username": user_data["username"],
                "email": user_data["email"],
                "password": hashlib.sha256(f"password123_{i}".encode()).hexdigest(),
                "phone": user_data["phone"],
                "address": user_data["address"],
                "is_active": True,
                "created_at": datetime.now() - timedelta(days=random.randint(1, 30))
            }
            self.users.append(user)
            
        print(f"✅ Created {len(self.users)} users")
    
    async def seed_sellers(self):
        """Seed sellers table"""
        print("🏪 Seeding sellers...")
        
        for i, seller_data in enumerate(SELLERS_DATA):
            seller = {
                "id": i + 1,
                "username": seller_data["username"],
                "email": seller_data["email"],
                "password": hashlib.sha256(f"seller_pass_{i}".encode()).hexdigest(),
                "phone": seller_data["phone"],
                "shop_name": seller_data["shop_name"],
                "shop_description": seller_data["shop_description"],
                "is_verified": seller_data["is_verified"],
                "created_at": datetime.now() - timedelta(days=random.randint(10, 60))
            }
            self.sellers.append(seller)
            
        print(f"✅ Created {len(self.sellers)} sellers")
    
    async def seed_products(self):
        """Seed products and related tables"""
        print("📦 Seeding products...")
        
        # Create categories first
        categories = [
            {"id": 1, "name": "Electronics", "parent_id": None},
            {"id": 2, "name": "Smartphones", "parent_id": 1},
            {"id": 3, "name": "Laptops", "parent_id": 1},
            {"id": 4, "name": "Fashion", "parent_id": None},
            {"id": 5, "name": "Shoes", "parent_id": 4},
            {"id": 6, "name": "Bags", "parent_id": 4},
        ]
        
        for i, product_data in enumerate(PRODUCTS_DATA):
            # Determine category
            category_id = 1  # Default to Electronics
            if "iPhone" in product_data["name"] or "Samsung" in product_data["name"]:
                category_id = 2  # Smartphones
            elif "MacBook" in product_data["name"] or "Dell" in product_data["name"]:
                category_id = 3  # Laptops
            elif "Nike" in product_data["name"] or "Adidas" in product_data["name"]:
                category_id = 5  # Shoes
            elif "Louis Vuitton" in product_data["name"]:
                category_id = 6  # Bags
            
            product = {
                "id": i + 1,
                "seller_id": random.choice([1, 2]),  # Random seller
                "name": product_data["name"],
                "description": product_data["description"],
                "brand": product_data["brand"],
                "category_id": category_id,
                "price": product_data["price"],
                "created_at": datetime.now() - timedelta(days=random.randint(1, 90))
            }
            self.products.append(product)
            
            # Create product variants
            variants = []
            if category_id == 5:  # Shoes
                sizes = ["39", "40", "41", "42", "43"]
                colors = ["Black", "White", "Red"]
                for size in sizes[:3]:  # Limit variants
                    for color in colors[:2]:
                        variant = {
                            "product_id": product["id"],
                            "size": size,
                            "color": color,
                            "quantity": random.randint(5, 50),
                            "price": product["price"] + random.randint(-500000, 500000)
                        }
                        variants.append(variant)
            
            # Create QR codes for each product
            qr_codes = []
            for j in range(random.randint(1, 3)):  # 1-3 QR codes per product
                qr_data = {
                    "product_id": product["id"],
                    "variant_id": variants[0]["id"] if variants else None,
                    "qr_code": self.generate_qr_code(product["id"], j),
                    "blockchain_hash": self.generate_hash(f"product_{product['id']}_{j}"),
                    "is_used": random.choice([True, False]),
                    "created_at": datetime.now() - timedelta(days=random.randint(1, 30))
                }
                qr_codes.append(qr_data)
        
        print(f"✅ Created {len(self.products)} products with variants and QR codes")
    
    async def seed_reviews(self):
        """Seed reviews for products"""
        print("⭐ Seeding reviews...")
        
        for product in self.products:
            # 3 reviews per product
            for i in range(3):
                review = {
                    "id": len(self.reviews) + 1,
                    "user_id": random.choice([u["id"] for u in self.users]),
                    "product_id": product["id"],
                    "content": random.choice(REVIEW_CONTENTS),
                    "rating": round(random.uniform(3.0, 5.0), 1),
                    "sentiment": round(random.uniform(0.2, 0.9), 2),  # Positive sentiment mostly
                    "created_at": datetime.now() - timedelta(days=random.randint(1, 45))
                }
                self.reviews.append(review)
        
        print(f"✅ Created {len(self.reviews)} reviews")
    
    async def seed_ai_risk_data(self):
        """Seed AI risk scores and training data"""
        print("🤖 Seeding AI risk data...")
        
        # Create product authenticity training data
        training_data = []
        for product in self.products:
            # Calculate features from reviews
            product_reviews = [r for r in self.reviews if r["product_id"] == product["id"]]
            avg_rating = sum(r["rating"] for r in product_reviews) / len(product_reviews) if product_reviews else 0
            avg_sentiment = sum(r["sentiment"] for r in product_reviews) / len(product_reviews) if product_reviews else 0
            
            # Determine authenticity (for training)
            # Higher-priced luxury brands are more likely to have counterfeits
            is_authentic = True
            if product["brand"] in ["Louis Vuitton", "Rolex"] and product["price"] < 20000000:
                is_authentic = False  # Suspiciously cheap luxury items
            elif avg_rating < 3.5 or avg_sentiment < 0.3:
                is_authentic = random.choice([True, False])  # Poor reviews might indicate fakes
            
            training_record = {
                "product_id": product["id"],
                "brand": product["brand"],
                "price": product["price"],
                "category_id": product["category_id"],
                "avg_rating": avg_rating,
                "review_count": len(product_reviews),
                "avg_sentiment": avg_sentiment,
                "has_qr_code": True,  # All our products have QR codes
                "qr_scan_count": random.randint(10, 1000),
                "is_authentic": is_authentic,
                "created_at": datetime.now()
            }
            training_data.append(training_record)
        
        # Generate AI risk scores (some products marked as high risk)
        high_risk_products = random.sample(self.products, 2)  # 2 high-risk products
        
        risk_scores = []
        for product in self.products:
            risk_score = 0.1 + random.random() * 0.3  # Low risk by default
            if product in high_risk_products:
                risk_score = 0.7 + random.random() * 0.3  # High risk
            
            risk_data = {
                "product_id": product["id"],
                "risk_score": round(risk_score, 3),
                "confidence": round(random.uniform(0.7, 0.95), 3),
                "model_version": "v1.0",
                "prediction_date": datetime.now(),
                "created_at": datetime.now()
            }
            risk_scores.append(risk_data)
        
        print(f"✅ Created {len(training_data)} training records and {len(risk_scores)} risk scores")
        print(f"⚠️  High-risk products: {[p['name'] for p in high_risk_products]}")
    
    async def run_seed(self):
        """Run all seeding operations"""
        print("🌱 Starting database seeding...")
        print("=" * 50)
        
        await self.seed_users()
        await self.seed_sellers()
        await self.seed_products()
        await self.seed_reviews()
        await self.seed_ai_risk_data()
        
        print("=" * 50)
        print("✅ Database seeding completed!")
        print("\n📊 Summary:")
        print(f"   👥 Users: {len(self.users)}")
        print(f"   🏪 Sellers: {len(self.sellers)}")
        print(f"   📦 Products: {len(self.products)}")
        print(f"   ⭐ Reviews: {len(self.reviews)}")
        print("\n🚀 Ready to start the services!")

# CLI interface
if __name__ == "__main__":
    seeder = DatabaseSeeder()
    asyncio.run(seeder.run_seed())
