-- 004-autonomous-grace.sql
-- Infrastructure for GRACE as autonomous agent: dispatches, email outbox

-- Dispatches: GRACE-authored blog posts
CREATE TABLE IF NOT EXISTS dispatches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL,
  author text NOT NULL DEFAULT 'GRACE',
  tags text[] DEFAULT '{}',
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dispatches_published_at ON dispatches(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_dispatches_slug ON dispatches(slug);

-- Email outbox: queued/sent emails from GRACE
CREATE TABLE IF NOT EXISTS email_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_email_outbox_status ON email_outbox(status);

-- RLS: service_role only (GRACE agent uses service key)
ALTER TABLE dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_outbox ENABLE ROW LEVEL SECURITY;

-- Allow public read on dispatches (blog is public)
CREATE POLICY "Public read dispatches" ON dispatches
  FOR SELECT TO anon USING (true);

-- Service role full access
CREATE POLICY "Service full access dispatches" ON dispatches
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service full access email_outbox" ON email_outbox
  FOR ALL TO service_role USING (true) WITH CHECK (true);
