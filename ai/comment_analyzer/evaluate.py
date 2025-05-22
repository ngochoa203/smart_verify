import torch
from sklearn.metrics import classification_report, confusion_matrix
from torch.utils.data import DataLoader
import pandas as pd
from transformers import RobertaForSequenceClassification, AutoTokenizer
from src.dataset import SentimentDataset

# Load tokenizer và mô hình
model_name = "vinai/phobert-base"
tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=False)
model = RobertaForSequenceClassification.from_pretrained(model_name, num_labels=3)
model.load_state_dict(torch.load("models/phobert_sentiment.pt"))
model.eval()

# Thiết bị
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Load và xử lý dữ liệu test
df = pd.read_csv("data//comments.csv")
texts = df["comment"].astype(str).tolist()
labels = df["label"].tolist()

# Dataloader
dataset = SentimentDataset(texts, labels, tokenizer)
loader = DataLoader(dataset, batch_size=8)

# Dự đoán
all_preds = []
all_labels = []

with torch.no_grad():
    for batch in loader:
        input_ids = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        labels_batch = batch["labels"].to(device)

        outputs = model(input_ids, attention_mask=attention_mask)
        preds = torch.argmax(outputs.logits, dim=1)

        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels_batch.cpu().numpy())

# Đánh giá
report = classification_report(all_labels, all_preds, target_names=["Negative", "Neutral", "Positive"])
conf_matrix = confusion_matrix(all_labels, all_preds)

# In kết quả
print("Classification Report:")
print(report)
print("Confusion Matrix:")
print(conf_matrix)

# Ghi ra file
with open("log/evaluate_report.txt", "w") as f:
    f.write("Classification Report:\n")
    f.write(report)
    f.write("\nConfusion Matrix:\n")
    f.write(str(conf_matrix))
