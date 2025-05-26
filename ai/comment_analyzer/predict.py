import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Lấy đường dẫn tuyệt đối tới thư mục model local
base_dir = os.path.dirname(__file__)
model_dir = os.path.join(base_dir, "phobert_sentiment")

# Load tokenizer và model
tokenizer = AutoTokenizer.from_pretrained(model_dir, local_files_only=True)
model = AutoModelForSequenceClassification.from_pretrained(model_dir, local_files_only=True)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()

def predict_sentiment(comment: str) -> int:
    if not comment.strip():
        return -1
    inputs = tokenizer(comment, return_tensors="pt", padding=True, truncation=True, max_length=128)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=1)
        predicted = torch.argmax(probs, dim=1).item()
    return predicted
