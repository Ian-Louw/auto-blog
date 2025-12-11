# AutoBlog - AI-Powered Content Platform

A full-stack blog platform that automatically generates articles daily using AI. Built with Next.js, Node.js, PostgreSQL, and deployed on AWS with a complete CI/CD pipeline.

**Live Demo:** Coming soon (deploy your own instance!)

> **Note:** This project includes automated CI/CD via GitHub Actions.

## What It Does

- Generates a new blog article every day at 2:00 AM UTC using HuggingFace AI
- Modern, responsive UI with Tailwind CSS
- RESTful API with PostgreSQL database
- Fully Dockerized for easy deployment
- Automated CI/CD with AWS CodeBuild and ECR
- Production-ready deployment on AWS EC2

## Tech Stack

**Frontend:**
- Next.js 14 (Pages Router)
- React 18
- Tailwind CSS (custom color palette)
- SWR for data fetching

**Backend:**
- Node.js 18 with Express
- Sequelize ORM
- PostgreSQL 14
- node-cron for scheduling
- HuggingFace Inference API

**DevOps:**
- Docker & Docker Compose
- AWS EC2 (eu-west-3)
- AWS ECR (Container Registry)
- AWS CodeBuild (CI/CD)
- GitHub Actions (optional)

## Quick Start

### Prerequisites

- Docker & Docker Compose
- HuggingFace account (free) - [Sign up here](https://huggingface.co/join)
- For deployment: AWS account

### 1. Clone the Repository

```bash
git clone https://github.com/Ian-Louw/auto-blog.git
cd auto-blog
```

### 2. Get Your HuggingFace Token

1. Visit https://huggingface.co/settings/tokens
2. Click "New token"
3. Name it (e.g., "auto-blog")
4. Select "Make calls to the serverless Inference API"
5. Copy the token (starts with `hf_`)

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
# HuggingFace AI
HF_TOKEN=hf_your_token_here
HF_MODEL=google/gemma-2-2b-it

# Database
DB_NAME=blogdb
DB_USER=bloguser
DB_PASS=blogpass
DB_HOST=postgres

# Backend
PORT=4000
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

### 4. Start the Application

```bash
cd infra
docker-compose up --build
```

Wait 30-60 seconds for services to start.

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/articles
- **Health Check:** http://localhost:4000/health

You'll see 3 initial seed articles.

### 6. Test Article Generation

```bash
curl -X POST http://localhost:4000/generate
```

Refresh http://localhost:3000 to see the new article!

## Project Structure

```
auto-blog/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── index.js           # Main server + cron scheduler
│   │   ├── models/index.js    # Sequelize Article model
│   │   ├── services/
│   │   │   ├── aiClient.js    # HuggingFace API client
│   │   │   └── articleJob.js  # Article generation logic
│   │   └── seed.js            # Database seeding
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # Next.js React app
│   ├── pages/
│   │   ├── _app.js            # Global app wrapper
│   │   ├── index.js           # Article list (homepage)
│   │   └── articles/[id].js   # Article detail page
│   ├── components/            # React components
│   │   ├── Header.js          # Navigation header
│   │   ├── Layout.js          # Page layout wrapper
│   │   ├── ArticleCard.js     # Article display card
│   │   └── Loading.js         # Loading spinner
│   ├── styles/
│   │   └── globals.css        # Tailwind CSS + custom styles
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── Dockerfile
│   └── package.json
│
├── infra/                      # Infrastructure & deployment
│   ├── buildspec.yml          # AWS CodeBuild configuration
│   ├── docker-compose.yml     # Local development
│   ├── docker-compose.prod.yml # Production on EC2
│   └── scripts/
│       ├── deploy.sh          # Deployment automation
│       └── init-ec2.sh        # EC2 setup script
│
├── docs/
│   └── ARCHITECTURE.md        # System architecture details
│
├── .env.example               # Environment template
├── QUICKSTART.md              # 5-minute setup guide
└── README.md                  # This file
```

## API Endpoints

### Health Check
```http
GET /health
```

Returns server and database status.

### List Articles
```http
GET /articles
```

Returns all articles ordered by newest first.

### Get Single Article
```http
GET /articles/:id
```

Returns article by ID or 404 if not found.

### Manual Generation (Testing)
```http
POST /generate
```

Triggers immediate article generation.

## UI Design

The frontend uses a custom Tailwind CSS design with this color palette:

- **Charcoal** (#424143) - Primary text and dark elements
- **Stone** (#9d9486) - Secondary text
- **Gold** (#eac37e) - Accents and CTAs
- **Cream** (#e4dac8) - Subtle backgrounds
- **Sage** (#dde3df) - Page background
- **White** (#ffffff) - Cards and content areas

Features:
- Responsive design for mobile, tablet, and desktop
- Smooth transitions and hover effects
- Loading states and error handling
- Hero section with call-to-action
- Article cards with gradients and shadows

## AI Article Generation

### How It Works

1. A cron job runs daily at **2:00 AM UTC**
2. The backend sends a prompt to HuggingFace's Inference API
3. The AI model generates a title and content
4. The article is saved to PostgreSQL
5. It immediately appears on the frontend

### Changing the AI Model

Edit `.env`:

```env
HF_MODEL=google/gemma-2-2b-it          # Default (recommended)
HF_MODEL=EleutherAI/gpt-neo-1.3B       # Larger model
HF_MODEL=facebook/opt-350m             # Faster model
```

Browse models at https://huggingface.co/models

### Changing the Schedule

Edit `backend/src/index.js` line 78:

```javascript
// Daily at 2:00 AM UTC
cron.schedule('0 2 * * *', async () => { ... });

// For testing: every minute
cron.schedule('*/1 * * * *', async () => { ... });
```

## AWS Deployment

### Architecture

```
GitHub → CodeBuild → ECR → EC2 (Docker Compose)
```

### Example Production Setup

- **Region:** eu-west-3 (Paris) - or your preferred region
- **Account:** <YOUR_AWS_ACCOUNT_ID>
- **EC2 Instance:** <YOUR_EC2_IP> (t3.micro recommended)
- **ECR Repos:**
  - `<YOUR_AWS_ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/auto-blog-backend`
  - `<YOUR_AWS_ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/auto-blog-frontend`
- **CodeBuild Project:** auto-blog-builder (or your chosen name)

### Deployment Process

#### When You Push to GitHub:

1. CodeBuild automatically triggered (if webhook enabled)
2. Builds Docker images for backend and frontend
3. Tags images with `latest` and git commit SHA
4. Pushes images to ECR

#### To Deploy New Images to EC2:

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@<YOUR_EC2_IP>

# Navigate to project
cd ~/auto-blog

# Login to ECR
aws ecr get-login-password --region eu-west-3 | \
  docker login --username AWS --password-stdin \
  <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com

# Pull latest images
docker-compose pull

# Restart with new images
docker-compose up -d --force-recreate
```

### Setting Up From Scratch

If you want to deploy your own instance:

#### 1. Create ECR Repositories

```bash
aws ecr create-repository --repository-name auto-blog-backend --region eu-west-3
aws ecr create-repository --repository-name auto-blog-frontend --region eu-west-3
```

#### 2. Create CodeBuild Project

1. Go to AWS CodeBuild console
2. Create project:
   - **Source:** GitHub (connect your fork)
   - **Environment:** Ubuntu Standard, Docker enabled
   - **Buildspec:** `infra/buildspec.yml`
   - **Service Role:** Create new with ECR push permissions
   - **Env variables:** `AWS_ACCOUNT_ID`, `AWS_DEFAULT_REGION`
3. Enable **Privileged mode** (required for Docker builds)

#### 3. Launch EC2 Instance

1. **AMI:** Amazon Linux 2023
2. **Instance type:** t3.micro (free tier eligible)
3. **Security Group:**
   - SSH (22) from your IP
   - HTTP (80) from anywhere
   - Custom TCP (3000) from anywhere
   - Custom TCP (4000) from anywhere
4. **Storage:** 20 GB gp3
5. Create and download key pair

#### 4. Setup EC2

SSH into your instance:

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

Install Docker and Docker Compose:

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L \
  "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Log out and back in for Docker group to take effect
exit
```

#### 5. Configure AWS Credentials on EC2

```bash
# SSH back in
ssh -i your-key.pem ec2-user@your-ec2-ip

# Configure AWS CLI (use IAM user with ECR read permissions)
aws configure
```

#### 6. Create Project Directory and Environment

```bash
mkdir -p ~/auto-blog
cd ~/auto-blog

# Create .env file
cat > .env << 'EOF'
DB_NAME=blogdb
DB_USER=bloguser
DB_PASS=your_secure_password_here
DB_HOST=db
PORT=4000
NODE_ENV=production
HF_TOKEN=hf_your_token_here
HF_MODEL=google/gemma-2-2b-it
NEXT_PUBLIC_API_BASE=http://YOUR_EC2_IP:4000
EOF

# Download production docker-compose
curl -o docker-compose.yml \
  https://raw.githubusercontent.com/Ian-Louw/auto-blog/master/infra/docker-compose.prod.yml
```

#### 7. Deploy

```bash
# Login to ECR
aws ecr get-login-password --region eu-west-3 | \
  docker login --username AWS --password-stdin \
  YOUR_ACCOUNT_ID.dkr.ecr.eu-west-3.amazonaws.com

# Pull images
docker-compose pull

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

Your blog is now live at `http://YOUR_EC2_IP`!

## Development

### Run Locally Without Docker

#### Backend

```bash
cd backend
npm install

# Start PostgreSQL (Docker)
docker run -d \
  --name postgres \
  -e POSTGRES_USER=bloguser \
  -e POSTGRES_PASSWORD=blogpass \
  -e POSTGRES_DB=blogdb \
  -p 5432:5432 \
  postgres:14-alpine

# Update .env with DB_HOST=localhost
echo "DB_HOST=localhost" >> .env

# Start server
npm run dev
```

#### Frontend

```bash
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_BASE=http://localhost:4000" > .env.local

# Start development server
npm run dev
```

### Useful Commands

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Stop everything
docker-compose down

# Stop and remove volumes (resets database)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Run commands in a container
docker-compose exec backend npm run seed
```

## Troubleshooting

### Backend won't start

**Check database connection:**
```bash
docker-compose logs postgres
docker-compose logs backend
```

Wait for PostgreSQL to fully initialize (can take 10-20 seconds on first run).

### Frontend shows "Loading articles..."

**Verify backend is running:**
```bash
curl http://localhost:4000/articles
```

**Check NEXT_PUBLIC_API_BASE:**
- Must be set during Docker build time
- Rebuild frontend if you changed it:
  ```bash
  docker-compose build --no-cache frontend
  docker-compose up -d frontend
  ```

### HuggingFace API Errors

1. Verify your `HF_TOKEN` in `.env`
2. Check token permissions at https://huggingface.co/settings/tokens
3. Try a different model if current one is overloaded
4. Check rate limits (free tier has limits)

### Port Already in Use

Edit `infra/docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change frontend port
  - "4001:4000"  # Change backend port
```

### Docker Build Fails on CodeBuild

1. Ensure "Privileged mode" is enabled in CodeBuild settings
2. Check service role has ECR permissions:
   - `ecr:GetAuthorizationToken`
   - `ecr:BatchCheckLayerAvailability`
   - `ecr:PutImage`
   - `ecr:InitiateLayerUpload`
   - `ecr:UploadLayerPart`
   - `ecr:CompleteLayerUpload`

### EC2 Deployment Issues

**Cannot SSH:**
- Check security group allows port 22 from your IP
- Verify key file permissions: `chmod 400 your-key.pem`

**Containers won't start:**
```bash
# Check Docker service
sudo systemctl status docker

# Check disk space
df -h

# Check logs
docker-compose logs

# Verify AWS CLI credentials
aws sts get-caller-identity
```

## Future Enhancements

- [ ] HTTPS with Let's Encrypt
- [ ] Better AI models (GPT-4, Claude)
- [ ] Article categories and tags
- [ ] Search functionality
- [ ] Admin panel for editing
- [ ] Comments system
- [ ] RSS feed
- [ ] Automatic EC2 deployment from CodeBuild
- [ ] Load balancer + auto-scaling
- [ ] CloudWatch monitoring
- [ ] Unit and integration tests
- [ ] Terraform/CDK infrastructure as code

## Contributing

This is a portfolio/demonstration project. Feel free to fork and customize for your own needs.

## License

MIT

## Author

**Ian Louw**
📧 ian@ianlouw.com
🌐 [ianlouw.com](https://ianlouw.com)
🐙 [GitHub](https://github.com/Ian-Louw)

