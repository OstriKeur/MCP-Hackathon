# Use an official Python runtime as a parent image
# Using Python 3.11 as requested
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files first (for better Docker layer caching)
COPY pyproject.toml uv.lock* ./

# Install uv for faster dependency management
RUN pip install --no-cache-dir uv

# Install dependencies using uv
RUN uv pip install --system --no-cache -r pyproject.toml

# Copy the application code
COPY main.py tools.py ./

# Create a non-root user for security
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Make port 3000 available to the world outside this container
# Your MCP server runs on port 3000 as defined in main.py
EXPOSE 3000

# Define environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=3000

# Health check to ensure the service is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:3000/health', timeout=5)" || exit 1

# Run the MCP server when the container launches
CMD ["python", "main.py"]
