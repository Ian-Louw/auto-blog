# Infrastructure & Deployment

Docker and AWS deployment configuration for AutoBlog.

## Files

- **`buildspec.yml`** - AWS CodeBuild configuration for CI/CD
- **`docker-compose.yml`** - Local development setup
- **`docker-compose.prod.yml`** - Production setup for EC2
- **`scripts/deploy.sh`** - Automated deployment script for EC2
- **`scripts/init-ec2.sh`** - EC2 instance initialization script

## Local Development

### Start All Services

```bash
cd infra
docker-compose up --build
```

This starts:
- **PostgreSQL** (port 5432)
- **Backend** (port 4000)
- **Frontend** (port 3000)

### Stop Services

```bash
docker-compose down

# With volume cleanup (resets database)
docker-compose down -v
```

### View Logs

```bash
docker-compose logs -f          # All services
docker-compose logs -f backend   # Backend only
docker-compose logs -f frontend  # Frontend only
```

## AWS Configuration

### Example Production Setup

- **Region:** eu-west-3 (Paris)
- **AWS Account:** <YOUR_AWS_ACCOUNT_ID>
- **EC2 Instance:** <YOUR_EC2_IP> (t3.micro)
- **ECR Repositories:**
  - `<YOUR_AWS_ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/auto-blog-backend`
  - `<YOUR_AWS_ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/auto-blog-frontend`
- **CodeBuild Project:** `auto-blog-builder`

### CodeBuild (buildspec.yml)

The `buildspec.yml` defines the CI/CD pipeline:

**Phases:**

1. **pre_build**
   - Login to ECR
   - Set image tag to git commit SHA (first 7 chars)
   - Prepare environment variables

2. **build**
   - Build backend Docker image
   - Build frontend Docker image (with API base URL)
   - Tag images with `latest` and commit SHA

3. **post_build**
   - Push backend images to ECR (both tags)
   - Push frontend images to ECR (both tags)
   - Output image URIs

**Environment Variables Required:**
- `AWS_ACCOUNT_ID` - Your AWS account ID
- `AWS_DEFAULT_REGION` - AWS region (eu-west-3)

**Important:** Enable **Privileged mode** in CodeBuild settings for Docker builds.

### Docker Compose Production

`docker-compose.prod.yml` is optimized for EC2:

**Differences from dev:**
- Uses ECR images instead of building locally
- Persistent volume path: `/var/lib/auto-blog/pgdata`
- Frontend on port 80 (not 3000)
- Logging configuration (10MB max, 3 files)
- Restart policy: `unless-stopped`

**Usage on EC2:**

```bash
# Set environment variables
export AWS_ACCOUNT_ID=<YOUR_AWS_ACCOUNT_ID>
export AWS_REGION=eu-west-3

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Pull images
docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## Deployment Scripts

### deploy.sh

Automates deployment to EC2:

```bash
./scripts/deploy.sh [IMAGE_TAG]
```

**What it does:**
1. Loads environment variables from `.env`
2. Validates AWS configuration
3. Logs into ECR
4. Pulls latest images from ECR
5. Stops existing containers
6. Starts new containers
7. Shows container status

**Usage:**

```bash
# Deploy latest
./scripts/deploy.sh

# Deploy specific version
./scripts/deploy.sh abc1234
```

### init-ec2.sh

Sets up a fresh EC2 instance:

```bash
./scripts/init-ec2.sh
```

**What it installs:**
1. Docker
2. Docker Compose
3. AWS CLI v2
4. Configures Docker to start on boot
5. Adds ec2-user to docker group

**After running:**
- Log out and back in for docker group to take effect
- Configure AWS credentials: `aws configure`

## Manual EC2 Deployment

### One-Time Setup

1. **Launch EC2 Instance**
   - AMI: Amazon Linux 2023
   - Type: t3.micro
   - Security Group:
     - SSH (22)
     - HTTP (80)
     - Custom TCP (3000, 4000)
   - Storage: 20 GB gp3

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ec2-user@<YOUR_EC2_IP>
   ```

3. **Run Init Script**
   ```bash
   curl -o init-ec2.sh https://raw.githubusercontent.com/Ian-Louw/auto-blog/master/infra/scripts/init-ec2.sh
   chmod +x init-ec2.sh
   ./init-ec2.sh

   # Log out and back in
   exit
   ssh -i your-key.pem ec2-user@<YOUR_EC2_IP>
   ```

4. **Configure AWS CLI**
   ```bash
   aws configure
   # Enter: Access Key, Secret Key, Region (eu-west-3), Output (json)
   ```

5. **Create Project Directory**
   ```bash
   mkdir -p ~/auto-blog
   cd ~/auto-blog

   # Download docker-compose
   curl -o docker-compose.yml \
     https://raw.githubusercontent.com/Ian-Louw/auto-blog/master/infra/docker-compose.prod.yml

   # Create .env
   cat > .env << 'EOF'
   DB_NAME=blogdb
   DB_USER=bloguser
   DB_PASS=<strong_password>
   DB_HOST=db
   PORT=4000
   NODE_ENV=production
   HF_TOKEN=hf_<your_token>
   HF_MODEL=google/gemma-2-2b-it
   NEXT_PUBLIC_API_BASE=http://<YOUR_EC2_IP>:4000
   AWS_ACCOUNT_ID=<YOUR_AWS_ACCOUNT_ID>
   AWS_REGION=eu-west-3
   EOF
   ```

### Deploy New Version

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

# Recreate containers with new images
docker-compose up -d --force-recreate

# Verify
docker-compose ps
docker-compose logs -f
```

## Troubleshooting

### CodeBuild Fails

**"permission denied" error:**
- Enable "Privileged mode" in CodeBuild project settings

**ECR push fails:**
- Check service role has ECR permissions
- Verify `AWS_ACCOUNT_ID` and `AWS_DEFAULT_REGION` environment variables

### EC2 Deployment Issues

**Cannot pull from ECR:**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Re-login to ECR
aws ecr get-login-password --region eu-west-3 | \
  docker login --username AWS --password-stdin \
  <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com
```

**Containers won't start:**
```bash
# Check logs
docker-compose logs

# Check disk space
df -h

# Check Docker service
sudo systemctl status docker
```

**Frontend shows old version:**
- Images may be cached
- Use `--force-recreate`:
  ```bash
  docker-compose up -d --force-recreate frontend
  ```

## Network Architecture

### Local Development

```
Host Machine
├─ Docker Network (blog-network)
│  ├─ postgres:5432
│  ├─ backend:4000
│  └─ frontend:3000
```

Accessible at:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Database: localhost:5432

### Production (EC2)

```
Internet
    ↓
EC2 Instance (<YOUR_EC2_IP>)
├─ Docker Network (blog-network)
│  ├─ postgres:5432 (internal only)
│  ├─ backend:4000 (exposed)
│  └─ frontend:80 (exposed)
```

Accessible at:
- Frontend: http://<YOUR_EC2_IP>
- Backend API: http://<YOUR_EC2_IP>:4000

## Security Considerations

### Production Checklist

- [ ] Use strong database password in `.env`
- [ ] Don't commit `.env` to Git
- [ ] Rotate HF_TOKEN periodically
- [ ] Use AWS Secrets Manager for sensitive data
- [ ] Enable HTTPS with Let's Encrypt
- [ ] Restrict EC2 security group (SSH to your IP only)
- [ ] Use IAM roles instead of AWS keys when possible
- [ ] Enable CloudWatch logging
- [ ] Set up automated backups

### IAM Permissions Required

**For CodeBuild Service Role:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    }
  ]
}
```

**For EC2 Instance Profile:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer"
      ],
      "Resource": "*"
    }
  ]
}
```

## Cost Optimization

### Current Setup (Free Tier)

- EC2 t3.micro: 750 hours/month (free tier)
- ECR: <500MB storage (free tier)
- CodeBuild: <100 build minutes/month (free tier)
- Data transfer: <15GB/month (free tier)

**Monthly cost:** $0 (within free tier)

### After Free Tier

Estimated costs:
- EC2 t3.micro: ~$8/month
- EBS storage (20GB): ~$2/month
- ECR storage: ~$1/month
- Data transfer: ~$1-2/month

**Total:** ~$12-13/month

## Monitoring

### Current Logs

```bash
# Container logs
docker-compose logs -f

# System logs
journalctl -u docker -f
```

### Recommended Additions

1. **CloudWatch Logs**
   - Forward Docker logs to CloudWatch
   - Set up alarms for errors

2. **CloudWatch Metrics**
   - CPU utilization
   - Memory usage
   - Disk space
   - API response times

3. **Health Checks**
   - Backend: `/health` endpoint
   - Frontend: Home page load time

## Backup & Recovery

### Database Backup

```bash
# Backup
docker-compose exec postgres pg_dump -U bloguser blogdb > backup.sql

# Restore
docker-compose exec -T postgres psql -U bloguser blogdb < backup.sql
```

### Full System Backup

1. Backup `.env` file
2. Backup PostgreSQL data
3. Document EC2 configuration
4. Keep infrastructure code in Git

## Author

**Ian Louw**
📧 ian@ianlouw.com
🌐 [ianlouw.com](https://ianlouw.com)
