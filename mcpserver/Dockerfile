# Use the official Python image
FROM python:3.13-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install the project into /app
COPY . /app
WORKDIR /app

# Allow statements and log messages to immediately appear in the logs
ENV PYTHONUNBUFFERED=1

# Set UV cache directory to /tmp which is always writable
ENV UV_CACHE_DIR=/tmp/uv-cache

# Install dependencies with clean cache
RUN uv sync --no-cache

EXPOSE 7860

ENV PORT=7860

# Run the FastMCP server
CMD ["uv", "run", "main.py"]

