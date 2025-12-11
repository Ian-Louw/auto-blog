#!/bin/bash
# Deployment Script for Auto-Blog Application on EC2
# This script pulls the latest images from ECR and deploys using docker-compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Auto-Blog Deployment Script"
echo "=========================================="

# Load environment variables from .env if it exists
if [ -f .env ]; then
    echo -e "${GREEN}Loading environment variables from .env${NC}"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}Warning: .env file not found. Using environment variables.${NC}"
fi

# Validate required environment variables
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${RED}Error: AWS_ACCOUNT_ID not set${NC}"
    exit 1
fi

if [ -z "$AWS_REGION" ]; then
    echo -e "${RED}Error: AWS_REGION not set${NC}"
    exit 1
fi

if [ -z "$HF_TOKEN" ]; then
    echo -e "${YELLOW}Warning: HF_TOKEN not set. AI generation may fail.${NC}"
fi

# Configuration
IMAGE_TAG=${1:-latest}
COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${YELLOW}Configuration:${NC}"
echo "  AWS Account: $AWS_ACCOUNT_ID"
echo "  AWS Region: $AWS_REGION"
echo "  Image Tag: $IMAGE_TAG"
echo "  Compose File: $COMPOSE_FILE"
echo ""

# Login to ECR
echo -e "${YELLOW}Logging in to Amazon ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin \
    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to login to ECR${NC}"
    exit 1
fi
echo -e "${GREEN}ECR login successful${NC}"

# Pull latest images
echo -e "${YELLOW}Pulling latest images from ECR...${NC}"
docker pull $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/auto-blog-backend:$IMAGE_TAG || {
    echo -e "${RED}Failed to pull backend image${NC}"
    exit 1
}

docker pull $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/auto-blog-frontend:$IMAGE_TAG || {
    echo -e "${RED}Failed to pull frontend image${NC}"
    exit 1
}
echo -e "${GREEN}Images pulled successfully${NC}"

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose -f $COMPOSE_FILE down || true

# Start new containers
echo -e "${YELLOW}Starting containers with docker-compose...${NC}"
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 10

# Check container status
echo -e "${YELLOW}Container status:${NC}"
docker-compose -f $COMPOSE_FILE ps

# Get public IP (if on EC2)
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")

echo ""
echo -e "${GREEN}=========================================="
echo -e "Deployment Complete!"
echo -e "==========================================${NC}"
echo ""
echo -e "${YELLOW}Application URLs:${NC}"
echo "  Frontend: http://$PUBLIC_IP"
echo "  Backend API: http://$PUBLIC_IP:4000"
echo "  Health Check: http://$PUBLIC_IP:4000/health"
echo ""
echo -e "${YELLOW}View logs:${NC}"
echo "  docker-compose -f $COMPOSE_FILE logs -f"
echo ""
echo -e "${YELLOW}View container status:${NC}"
echo "  docker-compose -f $COMPOSE_FILE ps"
echo ""
