import pandas as pd
import torch
from torch.utils.data import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import os

# ==== 1. Cấu hình ====
MODEL_NAME = "vinai/phobert-base"
MAX_LENGTH = 128
BATCH_SIZE = 16
EPOCHS = 3

# ==== 2. Load dữ liệu ====
df = pd.read_csv("res/dataset_comment.csv")

# Chỉ giữ lại nhãn 0 (negative), 1 (neutral), 2 (positive), loại NaN
df = df[df['label'].isin([0, 1, 2])]
df = df[df['comment'].notnull()]

# Cân bằng dữ liệu
# Giới hạn tối đa mỗi lớp là 1000 mẫu
max_samples = 200

# Đếm số mẫu của mỗi lớp
count_0 = df[df["label"] == 0].shape[0]
count_1 = df[df["label"] == 1].shape[0]
count_2 = df[df["label"] == 2].shape[0]

# Chọn số lượng nhỏ hơn giữa count_0, count_1, count_2 và max_samples
min_count = min(count_0, count_1, count_2, max_samples)

# Lấy mẫu cân bằng từ mỗi lớp
df_0 = df[df["label"] == 0].sample(n=min_count, random_state=42)
df_1 = df[df["label"] == 1].sample(n=min_count, random_state=42)
df_2 = df[df["label"] == 2].sample(n=min_count, random_state=42)

# Gộp lại và xáo trộn
df = pd.concat([df_0, df_1, df_2]).sample(frac=1, random_state=42).reset_index(drop=True)

# ==== 3. Tách train/test ====
train_texts, val_texts, train_labels, val_labels = train_test_split(
    df['comment'], df['label'], test_size=0.2, random_state=42
)

# ==== 4. Tokenizer ====
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

# ==== 5. Dataset Class ====
class CommentDataset(Dataset):
    def __init__(self, texts, labels):
        self.encodings = tokenizer(texts.tolist(), truncation=True, padding=True, max_length=MAX_LENGTH)
        self.labels = labels.tolist()

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx])
        return item

train_dataset = CommentDataset(train_texts, train_labels)
val_dataset = CommentDataset(val_texts, val_labels)

# ==== 6. Load model ====
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=3)

# ==== 7. Cấu hình huấn luyện ====
training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="steps",
    save_strategy="steps",
    eval_steps=500,
    save_steps=500,
    learning_rate=2e-5,
    per_device_train_batch_size=BATCH_SIZE,
    per_device_eval_batch_size=BATCH_SIZE,
    num_train_epochs=EPOCHS,
    weight_decay=0.01,
    logging_dir="./logs",
    logging_steps=100,
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",
    save_total_limit=3,
)

# ==== 8. Hàm đánh giá ====
def compute_metrics(pred):
    labels = pred.label_ids
    preds = pred.predictions.argmax(-1)
    report = classification_report(labels, preds, output_dict=True)
    return {
        "accuracy": report["accuracy"],
        "precision": report["weighted avg"]["precision"],
        "recall": report["weighted avg"]["recall"],
        "f1": report["weighted avg"]["f1-score"],
    }

# ==== 9. Huấn luyện ====
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    compute_metrics=compute_metrics,
)

trainer.train()
trainer.evaluate()

# ==== 10. Lưu đánh giá ====
preds = trainer.predict(val_dataset)
report = classification_report(val_labels, preds.predictions.argmax(-1), digits=4)
os.makedirs("log", exist_ok=True)
with open("log/train_report.txt", "w") as f:
    f.write(report)

print("\n=== Đánh giá mô hình ===\n")
print(report)
