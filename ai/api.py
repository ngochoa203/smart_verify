from fastapi import FastAPI
from pydantic import BaseModel
from comment_analyzer.predict import predict_sentiment
# from label_checker.model import check_label
# from ocr_model.ocr_reader import read_ocr
# from risk_scoring.model import get_risk_score

app = FastAPI()



app = FastAPI()

class SentimentRequest(BaseModel):
    text: str

@app.post("/sentiment/")
def get_sentiment(req: SentimentRequest):
    sentiment = predict_sentiment(req.text)
    return {"sentiment": sentiment}


# @app.post("/label/")
# def analyze_label(image_path: str):
#     return {"label_ok": check_label(image_path)}

# @app.post("/ocr/")
# def extract_text(image_path: str):
#     return {"text": read_ocr(image_path)}

# @app.post("/risk/")
# def evaluate_risk(comment: str):
#     return {"score": get_risk_score(comment)}
