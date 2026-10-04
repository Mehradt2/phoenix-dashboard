FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY text-intelligence/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY text-intelligence/app ./app
COPY text-intelligence/knowledge ./knowledge
USER 65532:65532
EXPOSE 8090
HEALTHCHECK --interval=20s --timeout=4s --retries=4 CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8090/health',timeout=3)"
CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8090","--workers","1"]
