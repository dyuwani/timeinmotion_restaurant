const { getSupabase } = require('./_supabase');

const MAX_SESSIONS = 50;

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('sessions')
      .select('id, label, saved_at, table_count, tx_count, use_case, venue')
      .order('saved_at', { ascending: false })
      .limit(MAX_SESSIONS);

    if (error) throw error;

    const sessions = (data || []).map(s => ({
      id: s.id,
      label: s.label,
      savedAt: s.saved_at,
      tableCount: s.table_count,
      txCount: s.tx_count,
      useCase: s.use_case,
      venue: s.venue,
    }));

    return res.status(200).json({ success: true, sessions });
  } catch (err) {
    console.error('[sessions]', err);
    return res.status(500).json({ error: 'Failed to fetch sessions', detail: err.message });
  }
};
