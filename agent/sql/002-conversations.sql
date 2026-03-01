-- 002-conversations.sql
-- Memory persistence for GRACE agent: conversations + member interactions

-- Conversations table: stores chat sessions with optional member link
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  member_id uuid references members(id) on delete set null,
  messages jsonb not null default '[]'::jsonb,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast session lookups
create index if not exists idx_conversations_session_id on conversations(session_id);
-- Index for member history queries
create index if not exists idx_conversations_member_id on conversations(member_id);

-- Member interactions table: tracks all touchpoints
create table if not exists member_interactions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  interaction_type text not null check (interaction_type in ('chat', 'signup', 'workstream_join')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Index for member interaction history
create index if not exists idx_member_interactions_member_id on member_interactions(member_id);

-- Auto-update updated_at on conversations
create or replace function update_conversations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger conversations_updated_at
  before update on conversations
  for each row
  execute function update_conversations_updated_at();
