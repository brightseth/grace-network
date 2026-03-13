-- GRACE Knowledge Table — Phase 1: Eyes Open
-- Stores curated research intelligence for GRACE's awareness.
--
-- Designed for compound intelligence across three phases:
--   Phase 1: Research briefs with relevance scoring (current)
--   Phase 2: Position formation — position_id links knowledge to evolving stances
--   Phase 3: Pattern recognition — trend_tags enable cross-topic pattern detection
--
-- Run via Supabase Dashboard SQL Editor (IPv6-only, no direct migration tool)

CREATE TABLE IF NOT EXISTS grace_knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Core content
  topic TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'ai-regulation',
  summary TEXT NOT NULL,
  sources TEXT[] DEFAULT '{}',

  -- Scoring and provenance
  relevance_score INTEGER NOT NULL DEFAULT 0,
  source_file TEXT UNIQUE,  -- dedup key: prevents re-ingesting same research brief

  -- Phase 2 fields (nullable now, used later)
  position_id UUID,          -- links to grace_positions table (Phase 2)
  evidence_weight REAL,      -- how strongly this supports/contradicts a position
  confidence_delta REAL,     -- change to position confidence when ingested

  -- Phase 3 fields (nullable now, used later)
  trend_tags TEXT[] DEFAULT '{}',  -- for pattern detection across entries

  -- Lifecycle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),

  -- Constraints
  CONSTRAINT valid_category CHECK (category IN (
    'ai-regulation',
    'digital-rights',
    'governance-innovation',
    'economic-distribution',
    'algorithmic-transparency',
    'movement-landscape'
  )),
  CONSTRAINT valid_relevance CHECK (relevance_score >= 0 AND relevance_score <= 10)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_grace_knowledge_category ON grace_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_grace_knowledge_expires ON grace_knowledge(expires_at);
CREATE INDEX IF NOT EXISTS idx_grace_knowledge_relevance ON grace_knowledge(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_grace_knowledge_position ON grace_knowledge(position_id) WHERE position_id IS NOT NULL;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_grace_knowledge_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER grace_knowledge_updated
  BEFORE UPDATE ON grace_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION update_grace_knowledge_timestamp();

-- RLS: Service key has full access (agent server), anon has read-only
ALTER TABLE grace_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON grace_knowledge
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Anon read access" ON grace_knowledge
  FOR SELECT USING (true);
