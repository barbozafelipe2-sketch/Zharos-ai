export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  try {
    const { messages = [], system, temperature = 0.6 } = req.body || {};
    if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages precisa ser um array' });

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature,
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          ...messages
        ]
      })
    });

    const data = await r.json();
    res.status(200).json({ reply: data?.choices?.[0]?.message?.content ?? '' });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
