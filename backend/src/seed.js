const { initDb, Article } = require('./models');

async function seedMinimum() {
  await initDb();
  const count = await Article.count();
  if (count >= 3) {
    console.log('Seed: already have >=3 articles');
    return;
  }
  await Article.bulkCreate([
  { 
    title: 'The Rise of Everyday AI Tools', 
    content: 'Artificial intelligence is quietly becoming part of daily life, powering apps that help us write, search, and create. As AI grows more intuitive, it’s reshaping how people work and communicate without requiring any technical expertise.' 
  },
  { 
    title: 'How Machine Learning Models Learn', 
    content: 'Modern ML models improve by analyzing large amounts of data and detecting patterns rather than following fixed instructions. This process allows them to adapt, recognize images, predict text, and tackle tasks that once required explicit programming.' 
  },
  { 
    title: 'The Future of Consumer Tech', 
    content: 'Advances in spatial computing, edge AI, and wearable devices promise a new wave of personalized tech experiences. As devices become smaller and smarter, technology will increasingly adapt to people—making digital interactions more seamless than ever.' 
  }
]);

  console.log('Seeded 3 articles');
}

if (require.main === module) {
  seedMinimum().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = { seedMinimum, seed: seedMinimum };
