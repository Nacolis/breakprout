# Use an official Python 3.14 base image
FROM python:3.14-slim AS builder

# Install uv from the official GitHub registry container image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy only requirements files to cache dependency installation
COPY pyproject.toml uv.lock ./

# Install dependencies using uv sync
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# Final light weight runtime stage
FROM python:3.14-slim

WORKDIR /app

# Copy the virtual environment containing installed dependencies
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY . .

# Prepend the virtual environment binaries to the PATH so that uvicorn/alembic run inside the virtualenv
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

# Start FastAPI application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
