import pandas as pd
import joblib
import sklearn.feature_extraction.text as TfidVectorizer
from sklearn.model_selection import train_test_split
import sklearn.linear_model as LogisticRegression

# Đọc dữ liệu từ file CSV
df = pd.read_csv('/dataset/brand_dataset.csv')

# Tạo bộ vectorizer (TF-IDF) và vector hóa văn bản
vecterizer = TfidVectorizer(max_features=1000)
x = vecterizer.fit_transform(df['brand_text'])

# Label
y = df['label']

# Chia dữ liệu thành tập huấn luyện và tập kiểm tra
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)

# Huấn luyện mô hình Logistic Regression
model = LogisticRegression.LogisticRegression()
model.fit(x_train, y_train)

# Do độ chính xác của mô hình
accuracy = model.score(x_test, y_test)
print(f"Accuracy: {accuracy * 100:.2f}%")

# Lưu mô hình và vectorizer đã huấn luyện
joblib.dump(model, '/models/brand_classifier.pkl')
joblib.dump(vecterizer, '/models/brand_vectorizer.pkl')

