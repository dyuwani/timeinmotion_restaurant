-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query)
-- to create the table the API routes (api/save.js, api/load.js, api/sessions.js) expect.

create table if not exists sessions (
  id          text primary key,
  label       text not null,
  saved_at    timestamptz not null default now(),
  tables      jsonb not null,
  table_count int not null default 0,
  tx_count    int not null default 0,
  use_case    text not null default 'finedining',
  venue       text
);

-- Safe to re-run on a table that already existed before use_case/venue existed.
alter table sessions add column if not exists use_case text not null default 'finedining';
alter table sessions add column if not exists venue text;

create index if not exists sessions_saved_at_idx on sessions (saved_at desc);

-- The API uses the service-role key (server-side only), which bypasses Row Level
-- Security entirely. RLS is enabled here as a safety net in case the anon key
-- ever gets used directly; no policies are defined, so anon/public access stays
-- fully locked out by default.
alter table sessions enable row level security;
