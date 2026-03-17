-- ============================================================
-- GRACE Network — Combined Migrations 003-006
-- Run in Supabase Dashboard SQL Editor
-- ============================================================

-- 003: Member memory + expanded interaction types
ALTER TABLE members ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE member_interactions DROP CONSTRAINT IF EXISTS member_interactions_interaction_type_check;
ALTER TABLE member_interactions ADD CONSTRAINT member_interactions_interaction_type_check
  CHECK (interaction_type IN (
    'chat', 'signup', 'workstream_join', 'interest_expressed',
    'question_asked', 'feedback_given', 'commitment_made', 'page_visit',
    'synthesis'
  ));

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS compressed_summary text;

-- 004: Dispatches + email outbox
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

ALTER TABLE dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read dispatches" ON dispatches FOR SELECT TO anon USING (true);
CREATE POLICY "Service full access dispatches" ON dispatches FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service full access email_outbox" ON email_outbox FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 005: Knowledge table (Phase 1)
CREATE TABLE IF NOT EXISTS grace_knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'ai-regulation',
  summary TEXT NOT NULL,
  sources TEXT[] DEFAULT '{}',
  relevance_score INTEGER NOT NULL DEFAULT 0,
  source_file TEXT UNIQUE,
  position_id UUID,
  evidence_weight REAL,
  confidence_delta REAL,
  trend_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
  CONSTRAINT valid_category CHECK (category IN (
    'ai-regulation', 'digital-rights', 'governance-innovation',
    'economic-distribution', 'algorithmic-transparency', 'movement-landscape'
  )),
  CONSTRAINT valid_relevance CHECK (relevance_score >= 0 AND relevance_score <= 10)
);
CREATE INDEX IF NOT EXISTS idx_grace_knowledge_category ON grace_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_grace_knowledge_expires ON grace_knowledge(expires_at);
CREATE INDEX IF NOT EXISTS idx_grace_knowledge_relevance ON grace_knowledge(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_grace_knowledge_position ON grace_knowledge(position_id) WHERE position_id IS NOT NULL;

CREATE OR REPLACE FUNCTION update_grace_knowledge_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER grace_knowledge_updated
  BEFORE UPDATE ON grace_knowledge FOR EACH ROW
  EXECUTE FUNCTION update_grace_knowledge_timestamp();

ALTER TABLE grace_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON grace_knowledge FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon read access" ON grace_knowledge FOR SELECT USING (true);

-- 006: Positions table (Phase 2)
CREATE TABLE IF NOT EXISTS grace_positions (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  category TEXT NOT NULL,
  stance TEXT NOT NULL,
  pillars TEXT[] DEFAULT '{}',
  evidence_for JSONB DEFAULT '[]',
  evidence_against JSONB DEFAULT '[]',
  confidence REAL NOT NULL DEFAULT 0.5,
  status TEXT NOT NULL DEFAULT 'seed',
  revisions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('seed', 'developing', 'established', 'contested', 'revised')),
  CONSTRAINT valid_confidence CHECK (confidence >= 0 AND confidence <= 1)
);
CREATE INDEX IF NOT EXISTS idx_grace_positions_category ON grace_positions(category);
CREATE INDEX IF NOT EXISTS idx_grace_positions_status ON grace_positions(status);
CREATE INDEX IF NOT EXISTS idx_grace_positions_confidence ON grace_positions(confidence DESC);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'grace_knowledge') THEN
    BEGIN
      ALTER TABLE grace_knowledge ADD CONSTRAINT fk_knowledge_position
        FOREIGN KEY (position_id) REFERENCES grace_positions(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;
