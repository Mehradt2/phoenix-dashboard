FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY services/api/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY services/api/app /app/app
COPY services/api/tests /app/tests
COPY web /app/web
CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8000"]
