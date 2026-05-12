FROM python:3.11-alpine

ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend_flask/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend_flask/ .

EXPOSE 5000
EXPOSE 4003


RUN ls -la
CMD ["python", "app.py"]
