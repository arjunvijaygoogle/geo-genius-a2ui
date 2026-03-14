# Use an official lightweight Python image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend code
COPY . .

# Cloud Run injects the $PORT environment variable automatically (default 8080)
# We use exec to pass signals properly to uvicorn
CMD exec uvicorn server:app --host 0.0.0.0 --port ${PORT:-8080}