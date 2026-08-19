const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const raw  = await kv.get('sessions:index');
    const list = raw ? JSON.parse(raw) : [];
    return res.status(200).json({ success: true, sessions: list });
  } catch (err) {
    console.error('[sessions]', err);
    return res.status(500).json({ error: 'Failed to fetch sessions', detail: err.message });
  }
};
