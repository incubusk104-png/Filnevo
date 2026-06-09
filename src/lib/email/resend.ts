// Minimal Resend sender for transactional emails (Edge-runtime compatible).
//
// Calls the Resend HTTP API directly with `fetch` so it runs on Cloudflare's
// Edge runtime (no Node SDK). Safely no-ops when not configured (demo / missing
// env) so the billing flow never fails just because email isn't set up yet.
//
// Required env (server-side only):
//   RESEND_API_KEY  — Resend API key (re_...).
//   RESEND_FROM     — verified sender, e.g. `Filnevo <noreply@filnevo.com>`.
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  sent: boolean;
  /** True when sending was skipped because Resend isn't configured. */
  skipped?: boolean;
  error?: string;
}

/** True when both the API key and a verified sender address are configured. */
export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

/**
 * Send one transactional email via Resend. Never throws — returns a result so
 * callers in the payment path can log-and-continue instead of failing the
 * upgrade.
 */
export async function sendTransactionalEmail(
  args: SendEmailArgs,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    return { sent: false, skipped: true };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject: args.subject,
        html: args.html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return {
        sent: false,
        error: `resend_${res.status}: ${detail.slice(0, 200)}`,
      };
    }

    return { sent: true };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : "resend_request_failed",
    };
  }
}
