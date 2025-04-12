FROM python:3.10

WORKDIR /ai

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "-m", "services.chat"]  # hoặc chạy module chính AI bạn cần
