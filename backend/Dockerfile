FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py database.py gemini.py ./

EXPOSE 5000

# Command to run the application
CMD ["python", "app.py"]