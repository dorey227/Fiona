export default async function handler(req, res) {
  // Allow requests from your frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, isVision } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        // If the app sends "isVision: true", use the Vision model. Otherwise, use the standard text chat model.
        model: isVision ? 'deepseek-vl' : 'deepseek-chat',
        messages: messages,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('DeepSeek proxy error:', error);
    return res.status(500).json({ error: 'AI service temporarily unavailable' });
  }
}
