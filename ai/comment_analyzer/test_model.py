import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Cấu hình
MODEL_NAME = "vinai/phobert-base"  # PhoBERT base model
MAX_LENGTH = 128  # Độ dài tối đa của mỗi văn bản

# Load model và tokenizer
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=3)  # Sử dụng 3 nhãn
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

# Hàm nhận diện cảm xúc (tiêu cực, trung tính, tích cực) từ comment
def predict_comment(comment):
    # Token hóa comment
    inputs = tokenizer(comment, return_tensors="pt", truncation=True, padding=True, max_length=MAX_LENGTH)
    
    # Dự đoán với mô hình
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
    
    # Chuyển logits thành nhãn
    prediction = torch.argmax(logits, dim=-1).item()
    
    # Mapping nhãn (0 -> Negative, 1 -> Neutral, 2 -> Positive)
    if prediction == 0:
        label = "Negative"
    elif prediction == 1:
        label = "Neutral"
    else:
        label = "Positive"
    
    return label

# Hàm chính để nhập comment và dự đoán
def main():
    while True:
        comment = input("Nhập comment (hoặc 'exit' để thoát): ")
        if comment.lower() == 'exit':
            print("Thoát khỏi chương trình.")
            break
        label = predict_comment(comment)
        print(f"Nhận diện cảm xúc: {label}\n")

if __name__ == "__main__":
    main()
