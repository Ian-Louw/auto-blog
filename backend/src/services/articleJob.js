const { Article } = require('../models');
const { generateText } = require('./aiClient');

function sanitizeTitleAndBody(text) {
  // split on first newline or punctuation to find title + body
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length >= 2) {
    return { title: lines[0].slice(0, 120), body: lines.slice(1).join('\n\n') };
  }
  // fallback: split by sentence
  const parts = text.split('. ').map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { title: parts[0].slice(0, 120), body: parts.slice(1).join('. ') };
  }
  return { title: text.slice(0, 120), body: text };
}

async function createArticle() {
  const prompt = `Write a concise blog article. Provide a short title in the first line, then a paragraph body. Topic: interesting tech topic for a general audience.`;
  const text = await generateText(prompt);
  const { title, body } = sanitizeTitleAndBody(text || '');
  const article = await Article.create({ title: title || 'Untitled', content: body || text || '' });
  return article;
}

module.exports = { createArticle };
