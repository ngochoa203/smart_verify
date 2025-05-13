import pandas as pd
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Đọc dữ liệu
df = pd.read_csv('dataset/brand_dataset.csv')

# Vector hóa văn bản
vectorizer = TfidfVectorizer(max_features=1000)
X = vectorizer.fit_transform(df['branch_text'])
y = df['label']

# Chia dữ liệu train/test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Huấn luyện mô hình
model = LogisticRegression()
model.fit(X_train, y_train)

# Tính độ chính xác
accuracy = model.score(X_test, y_test)
print(f"Accuracy: {accuracy * 100:.2f}%")

# Lưu mô hình và vectorizer
joblib.dump(model, 'models/brand_classifier.pkl')
joblib.dump(vectorizer, 'models/brand_vectorizer.pkl')

# Đánh giá mô hình
y_pred = model.predict(X_test)
report = classification_report(y_test, y_pred)
cm = confusion_matrix(y_test, y_pred)

# Ghi ra file kết quả
with open("log/train_report.txt", "w") as f:
    f.write(f"Accuracy: {accuracy:.4f}\n\n")
    f.write("Classification Report:\n")
    f.write(report + "\n")
    f.write("\nConfusion Matrix:\n")
    np.savetxt(f, cm, fmt='%d')
