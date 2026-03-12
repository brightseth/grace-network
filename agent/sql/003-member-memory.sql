-- 003-member-memory.sql
-- Add persistent per-member notes (Hermes-inspired curated memory)
-- and expand interaction types for richer activity tracking

-- Member notes: GRACE's curated observations about each member
-- Max ~1500 chars, loaded at session start, updated at session end
ALTER TABLE members ADD COLUMN IF NOT EXISTS notes text;

-- Expand interaction_type constraint to include richer taxonomy
ALTER TABLE member_interactions DROP CONSTRAINT IF EXISTS member_interactions_interaction_type_check;
ALTER TABLE member_interactions ADD CONSTRAINT member_interactions_interaction_type_check
  CHECK (interaction_type IN (
    'chat',
    'signup',
    'workstream_join',
    'interest_expressed',
    'question_asked',
    'feedback_given',
    'commitment_made',
    'page_visit'
  ));

-- Add summary column to conversations for compression
-- (stores condensed form of long conversations)
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS compressed_summary text;
