import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Đường dẫn tới thư mục model đã lưu (sau khi train trên Colab)
model_dir = "phobert_sentiment"  # hoặc "results/checkpoint-xxx" nếu bạn lấy từ checkpoint cụ thể

# Load tokenizer và model
tokenizer = AutoTokenizer.from_pretrained(model_dir)
model = AutoModelForSequenceClassification.from_pretrained(model_dir)

# Thiết bị sử dụng (GPU nếu có)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()

# Hàm dự đoán cảm xúc
def predict_sentiment(comment: str):
    if not comment.strip():
        return "Nội dung rỗng"

    # Tokenize
    inputs = tokenizer(
        comment,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=128
    )
    inputs = {k: v.to(device) for k, v in inputs.items()}

    # Dự đoán
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=1)
        predicted = torch.argmax(probs, dim=1).item()

    # Hiển thị xác suất của từng nhãn
    print(f"Xác suất: Negative={probs[0][0].item():.4f}, Neutral={probs[0][1].item():.4f}, Positive={probs[0][2].item():.4f}")
    
    # Đổi nhãn thành chữ
    if predicted == 0:
        label = "Negative"
    elif predicted == 1:
        label = "Neutral"
    else:
        label = "Positive"
        
    return label

# Vòng lặp nhập comment từ người dùng
if __name__ == "__main__":
    while True:
        text = input("Nhập comment (hoặc 'exit' để thoát): ")
        if text.lower() == "exit":
            break
        print("Nhận diện cảm xúc:", predict_sentiment(text))
