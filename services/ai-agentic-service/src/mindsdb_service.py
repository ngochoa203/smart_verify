import os
import requests
import json
from typing import Dict, List, Any
from datetime import datetime
from sqlalchemy.orm import Session
from src.models import AIRiskScore, ProductAuthenticityData, MindsDBModel
from src.database import get_db

class MindsDBService:
    def __init__(self):
        self.mindsdb_url = os.getenv("MINDSDB_URL", "http://localhost:47334")
        self.api_key = os.getenv("MINDSDB_API_KEY", "")
        
    async def create_model(self, db: Session) -> bool:
        """Create product authenticity predictor model in MindsDB"""
        try:
            # Create data source connection
            create_datasource_query = """
            CREATE DATABASE ecommerce_data
            WITH ENGINE = "postgres",
            PARAMETERS = {
                "user": "user",
                "password": "password", 
                "host": "localhost",
                "port": "5436",
                "database": "ai_risk_db"
            }
            """
            
            # Create model
            create_model_query = """
            CREATE MODEL product_authenticity_predictor
            FROM ecommerce_data
            (SELECT * FROM ai_risk_service.product_authenticity_data WHERE is_authentic IS NOT NULL)
            PREDICT is_authentic
            USING engine = 'lightgbm'
            """
            
            # Execute queries (simplified - in production use proper MindsDB SDK)
            headers = {"Authorization": f"Bearer {self.api_key}"}
            
            # Create datasource
            response1 = requests.post(
                f"{self.mindsdb_url}/api/sql/query",
                json={"query": create_datasource_query},
                headers=headers
            )
            
            # Create model  
            response2 = requests.post(
                f"{self.mindsdb_url}/api/sql/query", 
                json={"query": create_model_query},
                headers=headers
            )
            
            # Save model info
            model = MindsDBModel(
                model_name="product_authenticity_predictor",
                model_status="training",
                training_data_count=db.query(ProductAuthenticityData).filter(
                    ProductAuthenticityData.is_authentic.isnot(None)
                ).count()
            )
            db.add(model)
            db.commit()
            
            return True
            
        except Exception as e:
            print(f"Error creating MindsDB model: {e}")
            return False
    
    async def predict_risk_score(self, product_id: int, db: Session) -> float:
        """Get risk prediction for a product"""
        try:
            # Get product data
            product_data = db.query(ProductAuthenticityData).filter(
                ProductAuthenticityData.product_id == product_id
            ).first()
            
            if not product_data:
                return 0.5  # Default neutral risk
            
            # Query MindsDB for prediction
            predict_query = f"""
            SELECT is_authentic, is_authentic_confidence
            FROM mindsdb.product_authenticity_predictor
            WHERE brand = '{product_data.brand}'
            AND price = {product_data.price}
            AND avg_rating = {product_data.avg_rating or 0}
            AND review_count = {product_data.review_count or 0}
            AND has_qr_code = {product_data.has_qr_code}
            """
            
            headers = {"Authorization": f"Bearer {self.api_key}"}
            response = requests.post(
                f"{self.mindsdb_url}/api/sql/query",
                json={"query": predict_query},
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("data"):
                    prediction = result["data"][0]
                    is_authentic = prediction.get("is_authentic", True)
                    confidence = prediction.get("is_authentic_confidence", 0.5)
                    
                    # Convert to risk score (inverse of authenticity)
                    risk_score = 1.0 - (1.0 if is_authentic else 0.0)
                    
                    # Save prediction
                    ai_risk = AIRiskScore(
                        product_id=product_id,
                        risk_score=risk_score,
                        confidence=confidence,
                        model_version="v1.0",
                        features_used=json.dumps({
                            "brand": product_data.brand,
                            "price": product_data.price,
                            "avg_rating": product_data.avg_rating,
                            "review_count": product_data.review_count,
                            "has_qr_code": product_data.has_qr_code
                        })
                    )
                    db.add(ai_risk)
                    db.commit()
                    
                    return risk_score
            
            return 0.5  # Default if prediction fails
            
        except Exception as e:
            print(f"Error predicting risk score: {e}")
            return 0.5
    
    async def update_training_data(self, db: Session):
        """Aggregate data from other services for model training"""
        try:
            # This would typically fetch data from other services via API calls
            # For demo purposes, we'll create sample aggregated data
            
            # In production, you would:
            # 1. Call product-service API to get product data
            # 2. Call review-service API to get review aggregations
            # 3. Combine and store in ProductAuthenticityData table
            
            pass
            
        except Exception as e:
            print(f"Error updating training data: {e}")

# Service instance
mindsdb_service = MindsDBService()
