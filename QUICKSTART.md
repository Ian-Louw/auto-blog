# AutoBlog - Quick Start Guide

Get the AutoBlog platform running locally in under 5 minutes!

## Prerequisites

- **Docker Desktop** installed and running
- **HuggingFace account** (free) - [Sign up](https://huggingface.co/join)
- **Git** for cloning the repository

That's it! Docker handles everything else.

## Step 1: Clone the Repository

```bash
git clone https://github.com/Ian-Louw/auto-blog.git
cd auto-blog
```

## Step 2: Get Your HuggingFace Token

1. Go to https://huggingface.co/settings/tokens
2. Click **"New token"**
3. Name it: `auto-blog`
4. Select: **"Make calls to the serverless Inference API"**
5. Click **"Generate a token"**
6. **Copy the token** (it starts with `hf_`)

## Step 3: Create Environment File

Create a `.env` file in the root `auto-blog/` directory:

```bash
# Create .env file (Windows)
copy .env.example .env

# Create .env file (Mac/Linux)
cp .env.example .env
```

Edit `.env` and **only change this line**:

```env
HF_TOKEN=hf_paste_your_token_here
```

Everything else can stay as-is for local development.

## Step 4: Start the Application

```bash
cd infra
docker-compose up --build
```

**First time?** This will take 2-3 minutes to:
- Download Docker images
- Build frontend and backend
- Start PostgreSQL database
- Seed 3 initial articles

Watch for this message:
```
backend-1   | Backend listening on 4000
```

## Step 5: Open Your Browser

Visit **http://localhost:3000**

You should see the AutoBlog homepage with 3 AI-generated articles!

## Step 6: Test It Out

### Generate a New Article

In a new terminal:

```bash
curl -X POST http://localhost:4000/generate
```

Refresh your browser to see the new article appear!

### Check the API

```bash
# Get all articles
curl http://localhost:4000/articles

# Health check
curl http://localhost:4000/health
```

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just frontend
docker-compose logs -f frontend
```

### Stop the Application

```bash
# Stop but keep data
docker-compose down

# Stop and remove database data
docker-compose down -v
```

### Restart Services

```bash
docker-compose restart
```

### Rebuild After Code Changes

```bash
docker-compose down
docker-compose up --build
```

## Troubleshooting

### "Port already in use"

Another app is using port 3000 or 4000. Either:

**Option A:** Stop the other app

**Option B:** Change ports in `infra/docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Frontend
  - "4001:4000"  # Backend
```

Then update `.env`:
```env
NEXT_PUBLIC_API_BASE=http://localhost:4001
```

### "Loading articles..." Forever

1. Check backend is running:
   ```bash
   docker-compose logs backend
   ```

2. Wait 10-20 seconds for PostgreSQL to initialize

3. Check backend health:
   ```bash
   curl http://localhost:4000/health
   ```

### HuggingFace API Errors

1. **Token invalid**: Double-check your `HF_TOKEN` in `.env`
2. **Rate limit**: Wait a few minutes, free tier has limits
3. **Model loading**: Try a different model in `.env`:
   ```env
   HF_MODEL=facebook/opt-350m
   ```

### Database Won't Start

1. Check logs:
   ```bash
   docker-compose logs postgres
   ```

2. Reset everything:
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

### Docker Issues

```bash
# Check Docker is running
docker info

# Clean up Docker resources
docker system prune -a

# Restart Docker Desktop
```

## Next Steps

### Customize the AI

Edit `.env` to change the AI model:

```env
HF_MODEL=google/gemma-2-2b-it       # Default (fast)
HF_MODEL=EleutherAI/gpt-neo-1.3B    # Better quality
HF_MODEL=facebook/opt-350m          # Faster
```

### Change Generation Schedule

Edit `backend/src/index.js` line 78:

```javascript
// Every minute (for testing)
cron.schedule('*/1 * * * *', async () => {

// Daily at 2:00 AM (production)
cron.schedule('0 2 * * *', async () => {
```

### Customize the UI

The UI uses Tailwind CSS. Colors are defined in `frontend/tailwind.config.js`:

```javascript
colors: {
  'charcoal': '#424143',
  'stone': '#9d9486',
  'gold': '#eac37e',
  'cream': '#e4dac8',
  'sage': '#dde3df',
}
```

Edit pages in `frontend/pages/` and components in `frontend/components/`.

## Project Structure

```
auto-blog/
├── backend/          # Express API + AI generation
│   └── src/         # Server code
├── frontend/         # Next.js + Tailwind UI
│   ├── pages/       # Routes
│   └── components/  # React components
├── infra/           # Docker & deployment
│   ├── docker-compose.yml      # Local dev
│   └── docker-compose.prod.yml # Production
└── .env             # Your configuration
```

## Deploy to AWS

Ready to deploy? See the main [README.md](README.md#aws-deployment) for complete AWS deployment instructions including:

- ECR setup
- CodeBuild CI/CD
- EC2 deployment
- GitHub Actions automation

## Need Help?

- **Main docs:** See [README.md](README.md)
- **Architecture:** See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Frontend:** See [frontend/README.md](frontend/README.md)
- **Backend:** See [backend/README.md](backend/README.md)

## Author

**Ian Louw**
📧 ian@ianlouw.com
🌐 [ianlouw.com](https://ianlouw.com)

---

**Questions?** Check the troubleshooting section or open an issue on GitHub!
