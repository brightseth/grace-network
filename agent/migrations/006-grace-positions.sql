-- GRACE Positions Table — Phase 2: Position Memory
-- Living policy positions that evolve with evidence.
--
-- Primary store is file-based (agent/data/positions.json).
-- Supabase is a durable backup + enables future API queries.
--
-- Run via Supabase Dashboard SQL Editor (IPv6-only)

CREATE TABLE IF NOT EXISTS grace_positions (
  id TEXT PRIMARY KEY,

  -- Position content
  topic TEXT NOT NULL,
  category TEXT NOT NULL,
  stance TEXT NOT NULL,
  pillars TEXT[] DEFAULT '{}',

  -- Evidence
  evidence_for JSONB DEFAULT '[]',
  evidence_against JSONB DEFAULT '[]',

  -- Scoring
  confidence REAL NOT NULL DEFAULT 0.5,
  status TEXT NOT NULL DEFAULT 'seed',

  -- History
  revisions JSONB DEFAULT '[]',

  -- Lifecycle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN (
    'seed', 'developing', 'established', 'contested', 'revised'
  )),
  CONSTRAINT valid_confidence CHECK (confidence >= 0 AND confidence <= 1)
);

CREATE INDEX IF NOT EXISTS idx_grace_positions_category ON grace_positions(category);
CREATE INDEX IF NOT EXISTS idx_grace_positions_status ON grace_positions(status);
CREATE INDEX IF NOT EXISTS idx_grace_positions_confidence ON grace_positions(confidence DESC);

-- Link knowledge entries to positions (Phase 2 backfill)
-- The position_id column already exists in grace_knowledge from 005 migration.
-- This just adds the foreign key constraint.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'grace_knowledge') THEN
    BEGIN
      ALTER TABLE grace_knowledge
        ADD CONSTRAINT fk_knowledge_position
        FOREIGN KEY (position_id)
        REFERENCES grace_positions(id)
        ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
      NULL; -- constraint already exists
    END;
  END IF;
END $$;
