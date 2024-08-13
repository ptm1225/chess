FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app
COPY . .

RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get install -y stockfish

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]