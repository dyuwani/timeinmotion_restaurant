const { getSupabase } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id)
    return res.status(400).json({ error: 'id query param required' });

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('sessions')
      .select('id, label, saved_at, tables, use_case, venue')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data)
      return res.status(404).json({ error: 'Session not found' });

    const session = {
      id: data.id,
      label: data.label,
      savedAt: data.saved_at,
      tables: data.tables,
      useCase: data.use_case,
      venue: data.venue,
    };
    return res.status(200).json({ success: true, session });
  } catch (err) {
    console.error('[load]', err);
    return res.status(500).json({ error: 'Failed to load session', detail: err.message });
  }
};
