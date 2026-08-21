const { getSupabase } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { sessionId, label, tables, useCase, venue } = req.body || {};

    if (!sessionId || !Array.isArray(tables))
      return res.status(400).json({ error: 'sessionId and tables[] are required' });

    const supabase = getSupabase();
    const now = new Date().toISOString();
    const finalLabel = label || sessionId;
    const txCount = tables.reduce((sum, t) => sum + (t.transactions?.length || 0), 0);

    const { error } = await supabase.from('sessions').upsert({
      id: sessionId,
      label: finalLabel,
      saved_at: now,
      tables,
      table_count: tables.length,
      tx_count: txCount,
      use_case: useCase || 'finedining',
      venue: venue || null,
    });

    if (error) throw error;

    return res.status(200).json({ success: true, sessionId, savedAt: now });
  } catch (err) {
    console.error('[save]', err);
    return res.status(500).json({ error: 'Failed to save session', detail: err.message });
  }
};
