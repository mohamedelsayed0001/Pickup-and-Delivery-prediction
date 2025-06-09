# Use an official Python base image
FROM python:3.11-slim

# Install system dependencies (includes libgomp)
RUN apt-get update && apt-get install -y \
    gcc \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first, to take advantage of Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your app
COPY . .

# Expose the port
EXPOSE 8000

# Run the app
CMD ["uvicorn", "service:app", "--host", "0.0.0.0", "--port", "8000"]
