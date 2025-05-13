import joblib

# Đường dẫn tới mô hình và vectorizer đã huấn luyện
model_path = "/models/brand_classifier.pkl"
vectorizer_path = "/models/brand_vectorizer.pkl"

# Load mô hình và vectorizer đã huấn luyện
model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)

def predict_brand(text: str) -> str:
    vector = vectorizer.transform([text])
    prediction = model.predict(vector)
    return prediction[0] == 1