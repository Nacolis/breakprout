#!/bin/sh
set -e

# Run alembic migrations
echo "Running database migrations..."
alembic upgrade head

# Execute the main container process
echo "Starting application server..."
exec "$@"
