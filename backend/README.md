# Backend - Auto-Generated Blog

Express.js backend API for the Auto-Generated Blog with AI article generation.

## Tech Stack

- **Node.js 18** - Runtime
- **Express.js** - Web framework
- **Sequelize** - ORM for PostgreSQL
- **PostgreSQL** - Database
- **node-cron** - Task scheduler
- **Axios** - HTTP client for HuggingFace API

## Project Structure

```
backend/
├── src/
│   ├── index.js          # Main server & cron scheduler
│   ├── models/
│   │   └── index.js      # Sequelize Article model
│   ├── services/
│   │   ├── aiClient.js   # HuggingFace API integration
│   │   └── articleJob.js # Article generation logic
│   └── seed.js           # Database seeding script
├── Dockerfile            # Production Docker image
├── .dockerignore         # Docker build exclusions
├── .env.example          # Environment template
└── package.json          # Dependencies
```

## API Endpoints

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-09T12:00:00.000Z",
  "database": "connected",
  "service": "auto-blog-backend"
}
```

### Get All Articles

```http
GET /articles
```

Returns all articles ordered by creation date (newest first).

**Response:**
```json
[
  {
    "id": 1,
    "title": "Article Title",
    "content": "Article content...",
    "createdAt": "2025-12-09T12:00:00.000Z",
    "updatedAt": "2025-12-09T12:00:00.000Z"
  }
]
```

### Get Single Article

```http
GET /articles/:id
```

**Response:**
```json
{
  "id": 1,
  "title": "Article Title",
  "content": "Article content...",
  "createdAt": "2025-12-09T12:00:00.000Z",
  "updatedAt": "2025-12-09T12:00:00.000Z"
}
```

**Error (404):**
```json
{
  "message": "Not found"
}
```

### Generate Article (Manual)

```http
POST /generate
```

Manually triggers article generation. Useful for testing.

**Response:**
```json
{
  "id": 4,
  "title": "Generated Article Title",
  "content": "Generated content...",
  "createdAt": "2025-12-09T12:00:00.000Z",
  "updatedAt": "2025-12-09T12:00:00.000Z"
}
```

## Development

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
# Database
DB_HOST=localhost
DB_USER=bloguser
DB_PASS=blogpass
DB_NAME=blogdb

# HuggingFace
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxx
HF_MODEL=google/gemma-2-2b-it

# Server
PORT=4000
```

### Run PostgreSQL (Docker)

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_USER=bloguser \
  -e POSTGRES_PASSWORD=blogpass \
  -e POSTGRES_DB=blogdb \
  -p 5432:5432 \
  postgres:14-alpine
```

### Start Development Server

```bash
npm run dev
```

Server runs on http://localhost:4000

### Seed Database

```bash
npm run seed
```

This creates 3 initial articles.

## AI Article Generation

### How It Works

1. **Cron Job** triggers daily at 2:00 AM UTC
2. **articleJob.createArticle()** is called
3. Prompt sent to **HuggingFace Inference API**
4. Response parsed (extracts title and body)
5. Article saved to **PostgreSQL**
6. Success/error logged

### Changing the Schedule

Edit `src/index.js`:

```javascript
// Daily at 2:00 AM UTC
cron.schedule('0 2 * * *', async () => {
  // ...
});

// For testing: every minute
cron.schedule('*/1 * * * *', async () => {
  // ...
});
```

### Changing the AI Model

Set `HF_MODEL` in `.env`:

```env
HF_MODEL=google/gemma-2-2b-it      # Default, fast
HF_MODEL=EleutherAI/gpt-neo-1.3B   # Better quality
HF_MODEL=facebook/opt-350m         # Alternative
```

See HuggingFace free models: https://huggingface.co/models

## Database Schema

```sql
Table: Articles
┌─────────────┬──────────────┬──────────┬─────────────┐
│ Column      │ Type         │ Nullable │ Default     │
├─────────────┼──────────────┼──────────┼─────────────┤
│ id          │ INTEGER      │ NO       │ AUTO_INCREMENT │
│ title       │ STRING(255)  │ YES      │ NULL        │
│ content     │ TEXT         │ YES      │ NULL        │
│ createdAt   │ TIMESTAMP    │ NO       │ CURRENT_TS  │
│ updatedAt   │ TIMESTAMP    │ NO       │ CURRENT_TS  │
└─────────────┴──────────────┴──────────┴─────────────┘
```

## Docker

### Build Image

```bash
docker build -t auto-blog-backend .
```

### Run Container

```bash
docker run -p 4000:4000 \
  -e DB_HOST=postgres \
  -e DB_USER=bloguser \
  -e DB_PASS=blogpass \
  -e DB_NAME=blogdb \
  -e HF_TOKEN=hf_xxxxx \
  auto-blog-backend
```

## Testing

### Test Endpoints

```bash
# Health check
curl http://localhost:4000/health

# Get all articles
curl http://localhost:4000/articles

# Get single article
curl http://localhost:4000/articles/1

# Generate article manually
curl -X POST http://localhost:4000/generate
```

### View Logs

```bash
# If running with Docker Compose
docker-compose logs -f backend
```

## Error Handling

- Database connection failures return 500
- Article not found returns 404
- AI generation failures are logged but don't crash the server
- Cron job continues even if generation fails

## Security Considerations

- CORS enabled for frontend access
- Environment variables for secrets
- No authentication (add for production)
- Input validation needed for production
- Rate limiting recommended

## Deployment

See main README.md for AWS deployment instructions.

The backend runs as a Docker container on EC2, pulling images from ECR.
