#!/bin/bash

# Bytecode Detector Deployment Script
set -e

echo "🚀 Starting Bytecode Detector Deployment"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Build Docker image
echo "📦 Building Docker image..."
docker build -t bytecode-detector:latest .

# Run container
echo "🐳 Starting container..."
docker run -d     --name bytecode-detector     -p 8000:8000     --restart unless-stopped     bytecode-detector:latest

echo "✅ Deployment complete!"
echo "🌐 API available at: http://localhost:8000"
echo "📊 Health check: http://localhost:8000/health"
echo "🔍 Try: curl http://localhost:8000/health"
