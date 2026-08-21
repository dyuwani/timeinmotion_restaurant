const { getSupabase } = require('./_supabase');

// Report needs the full saved payload (tables jsonb) to compute aggregates
// client-side, unlike /api/sessions which only returns list metadata. Capped
// well above the 50-session "Load" list since a report should look back further.
const MAX_REPORT_SESSIONS = 300;

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('sessions')
      .select('id, label, saved_at, tables, use_case, venue, table_count, tx_count')
      .order('saved_at', { ascending: false })
      .limit(MAX_REPORT_SESSIONS);

    if (error) throw error;

    const sessions = (data || []).map(s => ({
      id: s.id,
      label: s.label,
      savedAt: s.saved_at,
      tables: s.tables,
      useCase: s.use_case || 'finedining',
      venue: s.venue,
      tableCount: s.table_count,
      txCount: s.tx_count,
    }));

    return res.status(200).json({ success: true, sessions });
  } catch (err) {
    console.error('[report]', err);
    return res.status(500).json({ error: 'Failed to load report data', detail: err.message });
  }
};
