#!/bin/bash

# Docker build script for NoteVault
# This script builds the Docker image with proper cache handling

echo "🐳 Building NoteVault Docker image..."

# Check if --no-cache flag should be used
if [ "$1" = "--no-cache" ]; then
    echo "🔄 Building with --no-cache flag (this will take longer but ensures fresh build)"
    docker build --no-cache -t notevault .
else
    echo "⚡ Building with cache (use --no-cache if you encounter issues)"
    docker build -t notevault .
fi

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo ""
    echo "To run the container:"
    echo "  docker run -d --name notevault -p 12000:12000 --env-file .env.local notevault"
    echo ""
    echo "Or use docker-compose:"
    echo "  docker compose up -d"
else
    echo "❌ Docker build failed!"
    echo ""
    echo "Common solutions:"
    echo "1. Try building with --no-cache: ./docker-build.sh --no-cache"
    echo "2. Check that .env.local exists and has correct DATABASE_URL"
    echo "3. Ensure PostgreSQL is running and accessible"
    exit 1
fi