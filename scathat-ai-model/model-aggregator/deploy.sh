#!/bin/bash

# Model Aggregator Deployment Script
# Builds and runs the Docker container for the aggregator API

set -e  # Exit on any error

# Configuration
CONTAINER_NAME="model-aggregator"
IMAGE_NAME="scathat-model-aggregator"
TAG="latest"
PORT="8001"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Model Aggregator Deployment${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Stop and remove existing container if it exists
echo -e "${YELLOW}🔄 Checking for existing container...${NC}"
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}⏹️  Stopping existing container...${NC}"
    docker stop "${CONTAINER_NAME}" > /dev/null 2>&1 || true
    echo -e "${YELLOW}🗑️  Removing existing container...${NC}"
    docker rm "${CONTAINER_NAME}" > /dev/null 2>&1 || true
fi

# Build Docker image
echo -e "${YELLOW}🏗️  Building Docker image...${NC}"
docker build -t "${IMAGE_NAME}:${TAG}" .

# Run the container
echo -e "${YELLOW}🐳 Starting new container...${NC}"
docker run -d \
    --name "${CONTAINER_NAME}" \
    -p "${PORT}:8001" \
    --restart unless-stopped \
    --network host \
    -e "BYTECODE_API_URL=http://localhost:8000" \
    "${IMAGE_NAME}:${TAG}"

# Wait for container to start
echo -e "${YELLOW}⏳ Waiting for container to start...${NC}"
sleep 5

# Check if container is running
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${GREEN}✅ Container started successfully!${NC}"
    
    # Check health status
    echo -e "${YELLOW}🏥 Checking service health...${NC}"
    HEALTH_CHECK=$(curl -s http://localhost:${PORT}/health || echo "unhealthy")
    
    if echo "$HEALTH_CHECK" | grep -q '"status":"healthy"'; then
        echo -e "${GREEN}✅ Service is healthy!${NC}"
        echo -e "${GREEN}🌐 API available at: http://localhost:${PORT}${NC}"
        echo -e "${GREEN}📊 Health endpoint: http://localhost:${PORT}/health${NC}"
    else
        echo -e "${YELLOW}⚠️  Service started but health check failed${NC}"
        echo -e "${YELLOW}📋 Check logs with: docker logs ${CONTAINER_NAME}${NC}"
    fi
else
    echo -e "${RED}❌ Container failed to start${NC}"
    echo -e "${YELLOW}📋 Check logs with: docker logs ${CONTAINER_NAME}${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Model Aggregator deployment complete!${NC}"
echo -e "${GREEN}📚 Available endpoints:${NC}"
echo -e "  • GET  /health - Service health check"
echo -e "  • POST /analyze/bytecode - Bytecode analysis"
echo -e "  • POST /analyze/multimodel - Multi-model analysis"
echo -e "  • GET  /models/status - Model availability"

# Show container status
echo -e "\n${YELLOW}📦 Container Status:${NC}"
docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"