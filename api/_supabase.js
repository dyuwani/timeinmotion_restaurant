const { createClient } = require('@supabase/supabase-js');

// Vercel's Supabase integration injects SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
// (and usually NEXT_PUBLIC_SUPABASE_URL / SUPABASE_ANON_KEY too). These API routes
// run entirely server-side, so we prefer the service role key to bypass RLS;
// fall back to the anon key if that's all that's available.
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client = null;

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      'Supabase env vars missing: need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) set in Vercel → Project → Settings → Environment Variables.'
    );
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}

module.exports = { getSupabase };
