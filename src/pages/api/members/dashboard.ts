import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_KEY,
);

export const GET: APIRoute = async ({ url }) => {
  const email = url.searchParams.get('email');
  if (!email) {
    return new Response(JSON.stringify({ error: 'Missing email parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get member
  const { data: member, error: memberErr } = await supabase
    .from('members')
    .select('id, first_name, last_name, email, statement, pledged, created_at')
    .eq('email', email)
    .single();

  if (memberErr || !member) {
    return new Response(JSON.stringify({ error: 'Member not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get conversations (most recent first, limit 20)
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, session_id, messages, summary, created_at, updated_at')
    .eq('member_id', member.id)
    .order('updated_at', { ascending: false })
    .limit(20);

  // Get interactions
  const { data: interactions } = await supabase
    .from('member_interactions')
    .select('id, interaction_type, metadata, created_at')
    .eq('member_id', member.id)
    .order('created_at', { ascending: false })
    .limit(50);

  // Get total member count for context
  const { count: memberCount } = await supabase
    .from('members')
    .select('id', { count: 'exact', head: true });

  // Compute stats
  const chatCount = interactions?.filter(i => i.interaction_type === 'chat').length || 0;
  const totalMessages = conversations?.reduce((sum, c) => {
    const msgs = Array.isArray(c.messages) ? c.messages : [];
    return sum + msgs.filter((m: any) => m.role === 'user').length;
  }, 0) || 0;

  return new Response(JSON.stringify({
    member: {
      firstName: member.first_name,
      lastName: member.last_name,
      email: member.email,
      statement: member.statement,
      joinedAt: member.created_at,
    },
    stats: {
      chatSessions: chatCount,
      totalMessages,
      networkSize: memberCount || 0,
    },
    conversations: (conversations || []).map(c => ({
      id: c.id,
      sessionId: c.session_id,
      messageCount: Array.isArray(c.messages) ? c.messages.length : 0,
      summary: c.summary,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    })),
    recentActivity: (interactions || []).slice(0, 20),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
