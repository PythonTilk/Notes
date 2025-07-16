#!/bin/bash

echo "🐳 Testing Docker Compose setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ docker-compose is not installed."
    exit 1
fi

echo "✅ Docker and docker-compose are available"

# Build and start services
echo "🔨 Building and starting services..."
docker-compose down --volumes --remove-orphans
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Test if the application is accessible
echo "🌐 Testing application accessibility..."
if curl -f http://localhost:12000 > /dev/null 2>&1; then
    echo "✅ Application is accessible at http://localhost:12000"
else
    echo "❌ Application is not accessible"
    echo "📋 Container logs:"
    docker-compose logs app
    exit 1
fi

echo "🎉 Docker setup test completed successfully!"
echo "🌐 Access your application at: http://localhost:12000"