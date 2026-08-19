const { kv } = require('@vercel/kv');

const MAX_SESSIONS = 50;        // how many sessions to keep in the index
const TTL_SECONDS  = 60 * 60 * 24 * 90; // 90-day expiry per session

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { sessionId, label, tables } = req.body || {};

    if (!sessionId || !Array.isArray(tables))
      return res.status(400).json({ error: 'sessionId and tables[] are required' });

    const now = new Date().toISOString();

    // ── Full session payload ──────────────────────────────────────────
    const session = { id: sessionId, label: label || sessionId, savedAt: now, tables };
    await kv.set(`session:${sessionId}`, JSON.stringify(session), { ex: TTL_SECONDS });

    // ── Update index list ─────────────────────────────────────────────
    const raw  = await kv.get('sessions:index');
    let   list = raw ? JSON.parse(raw) : [];

    // Remove stale entry for same ID, add fresh one at top
    list = list.filter(s => s.id !== sessionId);
    list.unshift({
      id:         sessionId,
      label:      session.label,
      savedAt:    now,
      tableCount: tables.length,
      txCount:    tables.reduce((sum, t) => sum + (t.transactions?.length || 0), 0),
    });
    list = list.slice(0, MAX_SESSIONS);

    await kv.set('sessions:index', JSON.stringify(list), { ex: TTL_SECONDS });

    return res.status(200).json({ success: true, sessionId, savedAt: now });
  } catch (err) {
    console.error('[save]', err);
    return res.status(500).json({ error: 'Failed to save session', detail: err.message });
  }
};
