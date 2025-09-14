# Use Python 3.11 slim image for smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install uv for faster dependency management
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv sync --frozen

# Copy application code
COPY game_api.py .

# Set default port (Cloud Run will override this with PORT env var)
ENV PORT=8000
EXPOSE $PORT

# Health check using PORT environment variable
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/ || exit 1

# Run the application using PORT environment variable
CMD ["sh", "-c", "uv run uvicorn game_api:app --host 0.0.0.0 --port $PORT"]
