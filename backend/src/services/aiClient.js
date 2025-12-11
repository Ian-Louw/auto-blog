// HF client using direct HTTP calls to the new router endpoint
const axios = require('axios');
const HF_TOKEN = process.env.HF_TOKEN || '';

if (!HF_TOKEN) {
  console.warn('Warning: HF_TOKEN not set. AI generation will fail without a token.');
}

// Use a model that supports the new Inference Providers (chat completion)
// Using Google Gemma which is widely available
const MODEL = process.env.HF_MODEL || 'google/gemma-2-2b-it';

async function generateText(prompt, maxLength = 512) {
  if (!HF_TOKEN) throw new Error('HF_TOKEN not provided');

  const url = 'https://router.huggingface.co/v1/chat/completions';

  const payload = {
    model: MODEL,
    messages: [
      {
        role: "user",
        content: `Write a short blog article about: ${prompt}. Keep it concise (2-3 paragraphs).`
      }
    ],
    max_tokens: 200
  };

  const resp = await axios.post(url, payload, {
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  return resp.data.choices[0].message.content;
}

module.exports = { generateText };
