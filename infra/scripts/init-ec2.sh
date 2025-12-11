#!/bin/bash
# EC2 Initialization Script for Auto-Blog Application
# This script sets up a fresh EC2 instance with Docker, Docker Compose, and AWS CLI

set -e

echo "=========================================="
echo "Auto-Blog EC2 Initialization Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo -e "${RED}Cannot detect OS${NC}"
    exit 1
fi

echo -e "${GREEN}Detected OS: $OS${NC}"

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
if [[ "$OS" == "amzn" ]] || [[ "$OS" == "rhel" ]] || [[ "$OS" == "centos" ]]; then
    sudo yum update -y
elif [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
    sudo apt-get update -y
    sudo apt-get upgrade -y
fi

# Install Docker
echo -e "${YELLOW}Installing Docker...${NC}"
if [[ "$OS" == "amzn" ]]; then
    sudo yum install docker -y
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ec2-user
elif [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
    sudo apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release

    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ubuntu
fi

# Install Docker Compose
echo -e "${YELLOW}Installing Docker Compose...${NC}"
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version

# Install AWS CLI v2
echo -e "${YELLOW}Installing AWS CLI v2...${NC}"
if [ ! -f /usr/local/bin/aws ]; then
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -o awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
fi
aws --version

# Install git (if not present)
echo -e "${YELLOW}Installing Git...${NC}"
if [[ "$OS" == "amzn" ]] || [[ "$OS" == "rhel" ]] || [[ "$OS" == "centos" ]]; then
    sudo yum install git -y
elif [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
    sudo apt-get install git -y
fi

# Create data directories
echo -e "${YELLOW}Creating data directories...${NC}"
sudo mkdir -p /var/lib/auto-blog/pgdata
sudo chown -R 999:999 /var/lib/auto-blog/pgdata

# Create application directory
echo -e "${YELLOW}Creating application directory...${NC}"
mkdir -p ~/auto-blog
cd ~/auto-blog

echo -e "${GREEN}=========================================="
echo -e "EC2 initialization complete!"
echo -e "==========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure AWS credentials: aws configure"
echo "2. Create .env file with your HF_TOKEN and other variables"
echo "3. Run the deploy script: ./deploy.sh"
echo ""
echo -e "${YELLOW}Sample .env file:${NC}"
echo "AWS_ACCOUNT_ID=123456789012"
echo "AWS_REGION=us-east-1"
echo "HF_TOKEN=hf_xxxxxxxxxxxxx"
echo "DB_PASS=your_secure_password"
echo "NEXT_PUBLIC_API_BASE=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):4000"
echo ""
echo -e "${GREEN}You may need to log out and back in for Docker permissions to take effect${NC}"
