import { createClient, type SupabaseClient } from "@supabase/supabase-js";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  statement: string | null;
  created_at: string;
}

interface Interaction {
  id: string;
  interaction_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface Conversation {
  id: string;
  session_id: string;
  member_id: string | null;
  messages: Message[];
  summary: string | null;
  created_at: string;
  updated_at: string;
}

interface MemberHistory {
  member: Member;
  conversations: Conversation[];
  interactions: Interaction[];
  chatCount: number;
}

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    console.warn("[GRACE memory] SUPABASE_URL or SUPABASE_SERVICE_KEY not set — memory disabled");
    return null;
  }

  client = createClient(url, key);
  return client;
}

export async function saveConversation(
  sessionId: string,
  messages: Message[],
  memberId?: string,
): Promise<void> {
  const sb = getClient();
  if (!sb) return;

  const { error } = await sb
    .from("conversations")
    .upsert(
      {
        session_id: sessionId,
        messages: JSON.stringify(messages),
        member_id: memberId || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" },
    );

  if (error) {
    console.error("[GRACE memory] saveConversation error:", error.message);
  }
}

export async function loadConversation(
  sessionId: string,
): Promise<Message[] | null> {
  const sb = getClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from("conversations")
    .select("messages")
    .eq("session_id", sessionId)
    .single();

  if (error || !data) return null;

  // messages may be stored as string or already parsed
  const msgs = typeof data.messages === "string"
    ? JSON.parse(data.messages)
    : data.messages;

  return msgs as Message[];
}

export async function getMemberByEmail(
  email: string,
): Promise<Member | null> {
  const sb = getClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from("members")
    .select("id, first_name, last_name, email, statement, created_at")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error || !data) return null;
  return data as Member;
}

export async function logInteraction(
  memberId: string,
  type: "chat" | "signup" | "workstream_join",
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const sb = getClient();
  if (!sb) return;

  const { error } = await sb
    .from("member_interactions")
    .insert({
      member_id: memberId,
      interaction_type: type,
      metadata,
    });

  if (error) {
    console.error("[GRACE memory] logInteraction error:", error.message);
  }
}

// ─── Member Memory: Persistent Per-Member Notes ──────────────────────
// Inspired by Hermes Agent's frozen-snapshot memory pattern.
// Curated notes about each member's interests, expertise, and history.
// Loaded at session start, written at session end. Max ~1500 chars.

export async function getMemberNotes(memberId: string): Promise<string | null> {
  const sb = getClient();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from("members")
      .select("notes")
      .eq("id", memberId)
      .single();

    if (error || !data) return null;
    return (data as any).notes || null;
  } catch {
    // Column may not exist yet — graceful degradation
    return null;
  }
}

export async function saveMemberNotes(
  memberId: string,
  notes: string,
): Promise<void> {
  const sb = getClient();
  if (!sb) return;

  // Enforce ~1500 char limit
  const truncated = notes.slice(0, 1500);

  const { error } = await sb
    .from("members")
    .update({ notes: truncated })
    .eq("id", memberId);

  if (error) {
    console.error("[GRACE memory] saveMemberNotes error:", error.message);
  }
}

export async function getMemberHistory(
  memberId: string,
): Promise<MemberHistory | null> {
  const sb = getClient();
  if (!sb) return null;

  // Fetch member
  const { data: member, error: memberErr } = await sb
    .from("members")
    .select("id, first_name, last_name, email, statement, created_at")
    .eq("id", memberId)
    .single();

  if (memberErr || !member) return null;

  // Fetch past conversations
  const { data: conversations } = await sb
    .from("conversations")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch interactions
  const { data: interactions } = await sb
    .from("member_interactions")
    .select("id, interaction_type, metadata, created_at")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(50);

  const chatCount = (interactions || []).filter(
    (i) => i.interaction_type === "chat",
  ).length;

  return {
    member: member as Member,
    conversations: (conversations || []) as Conversation[],
    interactions: (interactions || []) as Interaction[],
    chatCount,
  };
}

// ─── Initiative Support Functions ────────────────────────────────────

interface MemberListOptions {
  since?: Date;
  limit?: number;
}

export async function getAllMembers(
  opts: MemberListOptions = {},
): Promise<Member[] | null> {
  const sb = getClient();
  if (!sb) return null;

  let query = sb
    .from("members")
    .select("id, first_name, last_name, email, statement, created_at")
    .order("created_at", { ascending: false });

  if (opts.since) {
    query = query.gte("created_at", opts.since.toISOString());
  }
  if (opts.limit) {
    query = query.limit(opts.limit);
  }

  const { data, error } = await query;
  if (error || !data) return null;
  return data as Member[];
}

export async function getRecentInteractions(
  type: string,
  withinMinutes: number,
  memberId?: string,
): Promise<Interaction[] | null> {
  const sb = getClient();
  if (!sb) return null;

  const since = new Date(Date.now() - withinMinutes * 60 * 1000).toISOString();

  let query = sb
    .from("member_interactions")
    .select("id, interaction_type, metadata, created_at")
    .eq("interaction_type", type)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(100);

  if (memberId) {
    query = query.eq("member_id", memberId);
  }

  const { data, error } = await query;
  if (error || !data) return null;
  return data as Interaction[];
}
