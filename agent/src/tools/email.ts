/**
 * Email Tool for GRACE
 *
 * Sends emails to members. Currently logs to Supabase + console.
 * When an email service is configured (Resend, SES, etc.), this
 * becomes the real send path.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

interface EmailRecord {
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  status: "queued" | "sent" | "failed";
}

function getClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Send an email to a member.
 * Currently: logs to Supabase outbox table + console.
 * Future: integrate with Resend, SES, or Postmark.
 */
export async function sendMemberEmail(
  to: string,
  subject: string,
  body: string,
): Promise<boolean> {
  const record: EmailRecord = {
    to,
    subject,
    body,
    sentAt: new Date().toISOString(),
    status: "queued",
  };

  // Log to Supabase outbox
  const sb = getClient();
  if (sb) {
    const { error: outboxErr } = await sb
      .from("email_outbox")
      .insert({
        to_email: to,
        subject,
        body,
        status: "queued",
        created_at: record.sentAt,
      });
    if (outboxErr) console.error("[email] Outbox write failed:", outboxErr.message);
  }

  // Check for Resend API key
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "GRACE <grace@gracenetwork.org>",
          to: [to],
          subject,
          text: body,
        }),
      });

      if (res.ok) {
        console.log(`[email] Sent to ${to}: "${subject}"`);
        if (sb) {
          await sb
            .from("email_outbox")
            .update({ status: "sent" })
            .eq("to_email", to)
            .eq("subject", subject);
        }
        return true;
      } else {
        const err = await res.text();
        console.error(`[email] Resend error: ${err}`);
      }
    } catch (err) {
      console.error("[email] Send failed:", err instanceof Error ? err.message : err);
    }
  }

  // Fallback: just log it
  console.log(`[email] QUEUED (no send service configured)`);
  console.log(`  To: ${to}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  Body: ${body.slice(0, 200)}...`);

  return false;
}
