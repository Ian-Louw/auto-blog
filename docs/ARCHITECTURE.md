# System Architecture

## Overview

This document describes the architecture of the Auto-Generated Blog application, including the system design, deployment pipeline, and infrastructure setup.

## High-Level Architecture

```
┌─────────────┐
│   GitHub    │
│ Repository  │
└──────┬──────┘
       │ (1) Push Code
       ▼
┌─────────────┐
│AWS CodeBuild│
│             │
│ - Build     │
│ - Test      │
│ - Package   │
└──────┬──────┘
       │ (2) Push Images
       ▼
┌─────────────┐
│   AWS ECR   │
│  (Registry) │
└──────┬──────┘
       │ (3) Pull Images
       ▼
┌─────────────────────────────────────┐
│          AWS EC2 Instance           │
│                                     │
│  ┌──────────────┐  ┌─────────────┐│
│  │   Frontend   │  │   Backend   ││
│  │  (Next.js)   │◄─┤  (Express)  ││
│  │  Port: 3000  │  │  Port: 4000 ││
│  └──────────────┘  └──────┬──────┘│
│                            │       │
│                    ┌───────▼──────┐│
│                    │  PostgreSQL  ││
│                    │  Port: 5432  ││
│                    └──────────────┘│
└─────────────────────────────────────┘
       ▲
       │ (4) Access
       │
┌──────┴──────┐
│   Users     │
└─────────────┘
```

## Component Details

### 1. Frontend (Next.js)

**Technology Stack:**
- Next.js 14 (Pages Router)
- React 18
- SWR for data fetching

**Responsibilities:**
- Display list of articles
- Show individual article details
- Auto-refresh data every 5 seconds
- Responsive UI

**Key Files:**
- `pages/index.js` - Article list page
- `pages/articles/[id].js` - Article detail page
- `pages/_app.js` - App wrapper
- `next.config.js` - Configuration

**Docker:**
- Multi-stage build for optimization
- Standalone output for smaller image
- Runs on port 3000

### 2. Backend (Node.js + Express)

**Technology Stack:**
- Node.js 18
- Express.js
- Sequelize ORM
- node-cron for scheduling
- Axios for HTTP requests

**Responsibilities:**
- RESTful API endpoints
- Database operations (CRUD)
- AI article generation
- Scheduled daily tasks
- HuggingFace API integration

**Key Endpoints:**
- `GET /articles` - List all articles
- `GET /articles/:id` - Get single article
- `POST /generate` - Manual generation (testing)

**Key Files:**
- `src/index.js` - Main server & scheduler
- `src/models/index.js` - Sequelize models
- `src/services/aiClient.js` - HuggingFace integration
- `src/services/articleJob.js` - Generation logic
- `src/seed.js` - Database seeding

**Docker:**
- Production dependencies only
- Runs on port 4000

### 3. Database (PostgreSQL)

**Technology:**
- PostgreSQL 14 Alpine

**Schema:**

```sql
Table: Articles
┌─────────────┬──────────────┬──────────┐
│ Column      │ Type         │ Nullable │
├─────────────┼──────────────┼──────────┤
│ id          │ INTEGER      │ NO       │
│ title       │ STRING(255)  │ YES      │
│ content     │ TEXT         │ YES      │
│ createdAt   │ TIMESTAMP    │ NO       │
│ updatedAt   │ TIMESTAMP    │ NO       │
└─────────────┴──────────────┴──────────┘
```

**Data Management:**
- Auto-seeding with 3 initial articles
- Persistent volume for data
- Health checks for reliability

### 4. AI Generation Service

**Provider:** HuggingFace Inference API

**Flow:**
```
1. Cron triggers daily (2:00 AM UTC)
2. articleJob.createArticle() called
3. Prompt sent to HuggingFace API
4. Response parsed (title + body)
5. Article saved to PostgreSQL
6. Success/error logged
```

**Models:**
- Default: `google/gemma-2-2b-it` (fast, free)
- Alternatives: GPT-Neo, OPT, etc.

**Error Handling:**
- API failures logged
- Cron continues on error
- Manual trigger available for testing

## Deployment Pipeline

### CI/CD Flow

```
Developer
   │
   │ git push
   ▼
GitHub Repository
   │
   │ webhook/trigger
   ▼
AWS CodeBuild
   ├─ Phase 1: pre_build
   │  ├─ Login to ECR
   │  ├─ Set IMAGE_TAG
   │  └─ Prepare environment
   │
   ├─ Phase 2: build
   │  ├─ Build backend image
   │  ├─ Build frontend image
   │  └─ Tag images
   │
   └─ Phase 3: post_build
      ├─ Push backend:latest
      ├─ Push backend:${IMAGE_TAG}
      ├─ Push frontend:latest
      └─ Push frontend:${IMAGE_TAG}
         │
         ▼
AWS ECR Repositories
   ├─ auto-blog-backend
   └─ auto-blog-frontend
         │
         │ docker pull (manual/automated)
         ▼
AWS EC2 Instance
   └─ Docker Compose
      ├─ PostgreSQL container
      ├─ Backend container
      └─ Frontend container
```

### Deployment Steps

#### Initial Setup (One-time)

1. **Create ECR Repositories**
   ```bash
   aws ecr create-repository --repository-name auto-blog-backend
   aws ecr create-repository --repository-name auto-blog-frontend
   ```

2. **Create CodeBuild Project**
   - Source: GitHub
   - Branch: main/master
   - Buildspec: `infra/buildspec.yml`
   - Environment: Ubuntu, Docker enabled
   - Service Role: With ECR push permissions

3. **Launch EC2 Instance**
   - AMI: Amazon Linux 2023
   - Type: t3.micro (free tier)
   - Storage: 8-30 GB gp3
   - Security Groups: 22 (SSH), 80/3000 (HTTP), 4000 (API)

4. **Setup EC2**
   ```bash
   # SSH into EC2
   ssh -i key.pem ec2-user@ec2-ip

   # Install Docker
   sudo yum update -y
   sudo yum install docker -y
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker ec2-user

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose

   # Install AWS CLI
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install

   # Configure AWS credentials (use IAM role or keys)
   aws configure
   ```

#### Continuous Deployment

**Option A: Manual Deployment**

```bash
# On EC2 instance
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker-compose pull
docker-compose up -d --force-recreate
```

**Option B: Automated with Script**

Create deployment script triggered by CodeBuild or webhook.

## Environment Configuration

### Local Development

```env
# .env (root)
HF_TOKEN=hf_xxxxx
HF_MODEL=google/gemma-2-2b-it
DB_NAME=blogdb
DB_USER=bloguser
DB_PASS=blogpass
DB_HOST=postgres
PORT=4000
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

### Production (EC2)

```env
# .env on EC2
HF_TOKEN=hf_xxxxx
HF_MODEL=google/gemma-2-2b-it
DB_NAME=blogdb
DB_USER=bloguser
DB_PASS=<strong-password>
DB_HOST=postgres
PORT=4000
NEXT_PUBLIC_API_BASE=http://<EC2_PUBLIC_IP>:4000
```

**Security Best Practices:**
- Store HF_TOKEN in AWS Secrets Manager
- Use IAM roles instead of AWS keys
- Rotate database passwords
- Enable encryption at rest

## Network Architecture

### Docker Network (Local/EC2)

```
blog-network (bridge)
   │
   ├─ postgres:5432
   │  └─ Persistent volume: pgdata
   │
   ├─ backend:4000
   │  └─ Connects to postgres
   │
   └─ frontend:3000
      └─ Connects to backend (via NEXT_PUBLIC_API_BASE)
```

### Security Groups (EC2)

| Port | Protocol | Source      | Purpose         |
|------|----------|-------------|-----------------|
| 22   | TCP      | Your IP     | SSH access      |
| 3000 | TCP      | 0.0.0.0/0   | Frontend HTTP   |
| 4000 | TCP      | 0.0.0.0/0   | Backend API     |
| 5432 | TCP      | localhost   | PostgreSQL      |

**Note:** For production, port 5432 should NOT be exposed publicly.

## Scaling Considerations

### Current Architecture (MVP)
- Single EC2 instance
- Single PostgreSQL instance
- No load balancing
- No auto-scaling

### Future Improvements

#### Short-term
1. **Load Balancer + Auto-scaling**
   - Application Load Balancer (ALB)
   - Auto-scaling group for EC2
   - Health checks

2. **Managed Database**
   - Amazon RDS for PostgreSQL
   - Automated backups
   - Multi-AZ deployment

3. **Static Asset CDN**
   - CloudFront for Next.js static files
   - S3 for image storage

#### Long-term
1. **Container Orchestration**
   - Amazon ECS/Fargate
   - Kubernetes (EKS)

2. **Serverless Backend**
   - API Gateway + Lambda
   - DynamoDB instead of RDS

3. **Microservices**
   - Separate AI generation service
   - Event-driven architecture (SNS/SQS)

## Monitoring & Logging

### Current Setup
- Docker container logs
- Application console logs

### Recommended Additions
1. **CloudWatch**
   - Container logs
   - Custom metrics (articles generated, API latency)
   - Alarms for errors

2. **Application Performance Monitoring (APM)**
   - AWS X-Ray for tracing
   - DataDog/New Relic for metrics

3. **Health Checks**
   - `/health` endpoint on backend
   - CloudWatch alarms on failures

## Backup & Recovery

### Database Backups
- PostgreSQL volume backed up regularly
- Manual: `docker exec postgres pg_dump...`
- Automated with scripts or RDS

### Disaster Recovery
1. Infrastructure as Code (Terraform/CloudFormation)
2. Container images in ECR (multiple versions)
3. Database snapshots (daily)
4. Documentation for rapid rebuild

## Cost Estimation (AWS Free Tier)

| Service      | Usage                | Cost (Monthly) |
|--------------|----------------------|----------------|
| EC2 t3.micro | 750 hrs/month        | $0 (free tier) |
| ECR          | <500MB storage       | $0 (free tier) |
| CodeBuild    | 100 mins/month       | $0 (free tier) |
| Data Transfer| <15GB/month          | $0 (free tier) |
| HuggingFace  | Free Inference API   | $0             |

**Total:** $0/month (within free tier limits)

**Note:** After free tier expires, estimate ~$10-15/month.

## Security Considerations

### Current Implementation
- Environment variables for secrets
- Docker network isolation
- CORS enabled on backend

### Recommended Enhancements
1. **HTTPS/TLS**
   - Let's Encrypt certificate
   - Nginx reverse proxy
   - Force HTTPS redirect

2. **Secrets Management**
   - AWS Secrets Manager
   - Environment encryption

3. **API Security**
   - Rate limiting
   - API key authentication
   - Input validation & sanitization

4. **Database Security**
   - No public access
   - Encrypted connections
   - Regular security patches

## Performance Optimization

### Current Optimizations
- Multi-stage Docker builds
- Next.js standalone output
- SWR caching on frontend
- PostgreSQL indexes on `createdAt`

### Future Optimizations
1. **Caching Layer**
   - Redis for API responses
   - CloudFront for static assets

2. **Database**
   - Query optimization
   - Connection pooling
   - Read replicas

3. **Frontend**
   - Static generation for articles
   - Image optimization
   - Code splitting

## Conclusion

This architecture provides a solid foundation for the Auto-Generated Blog application and design allows for future scalability and improvements without requiring a complete rewrite.

---

**Last Updated:** December 2025
**Version:** 1.0
