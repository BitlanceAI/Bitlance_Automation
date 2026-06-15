FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Install system dependencies for Pillow
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create outputs directory
RUN mkdir -p outputs

# Azure App Service sends PORT env var (usually 8000 or 80)
# Default to 8000 if not set
ENV PORT=8001
EXPOSE 8001

# Health check for Azure — app must respond at / within timeout
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT}/ || exit 1

# Run the application — Azure sets PORT, we honour it
CMD ["sh", "-c", "echo 'Starting GEO (Generative) AI Agent on port ${PORT}' && uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
