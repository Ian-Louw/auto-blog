const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initDb, Article } = require('./models');
const articleJob = require('./services/articleJob');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await Article.count();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      service: 'auto-blog-backend'
    });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: err.message
    });
  }
});

app.get('/articles', async (req, res) => {
  try {
    const articles = await Article.findAll({ order: [['createdAt', 'DESC']] });
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed' });
  }
});

app.get('/articles/:id', async (req, res) => {
  try {
    const a = await Article.findByPk(req.params.id);
    if (!a) return res.status(404).json({ message: 'Not found' });
    res.json(a);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed' });
  }
});

// Optional manual generation endpoint
app.post('/generate', async (req, res) => {
  try {
    const article = await articleJob.createArticle();
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed' });
  }
});

const PORT = process.env.PORT || 4000;

async function start() {
  await initDb();

  // ensure at least 3 articles on first start (seed logic)
  const count = await Article.count();
  if (count < 3) {
    await require('./seed').seedMinimum();
  }

  // Scheduler: runs daily at 02:00 UTC. For local testing change to '*/1 * * * *'
  const cron = require('node-cron');
  cron.schedule('0 2 * * *', async () => {
    console.log('[cron] daily generator triggered');
    try {
      await articleJob.createArticle();
    } catch (err) {
      console.error('cron error', err);
    }
  });

  app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
}

start().catch(err => {
  console.error('Failed to start', err);
  process.exit(1);
});
