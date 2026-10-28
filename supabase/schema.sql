-- ============================================================
--  PlayStation Shop Manager — Supabase Schema
--  Run this once in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Single key/value store table (replaces database.json)
CREATE TABLE IF NOT EXISTS store (
  key    TEXT PRIMARY KEY,
  value  JSONB NOT NULL DEFAULT 'null'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update timestamp on every write
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER store_updated_at
  BEFORE UPDATE ON store
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
--  Row Level Security
--  The API function uses the service_role key (bypasses RLS)
--  so we enable RLS and block all public access.
-- ============================================================
ALTER TABLE store ENABLE ROW LEVEL SECURITY;

-- No public read/write — only service_role key (used by Vercel) can access
-- (service_role bypasses RLS entirely, so no extra policy needed)
