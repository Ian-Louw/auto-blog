const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'blogdb',
  process.env.DB_USER || 'bloguser',
  process.env.DB_PASS || 'blogpass',
  {
    host: process.env.DB_HOST || 'postgres',
    dialect: 'postgres',
    logging: false
  }
);

const Article = sequelize.define('Article', {
  title: { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT }
});

async function initDb() {
  await sequelize.authenticate();
  await sequelize.sync();
}

module.exports = { sequelize, Article, initDb };
