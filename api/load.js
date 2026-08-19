const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id)
    return res.status(400).json({ error: 'id query param required' });

  try {
    const raw = await kv.get(`session:${id}`);
    if (!raw)
      return res.status(404).json({ error: 'Session not found' });

    const session = JSON.parse(raw);
    return res.status(200).json({ success: true, session });
  } catch (err) {
    console.error('[load]', err);
    return res.status(500).json({ error: 'Failed to load session', detail: err.message });
  }
};
