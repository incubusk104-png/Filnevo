// Cloudflare Turnstile — server-side token verification.
//
// This is the server half of the reusable CAPTCHA "template": any route or
// server action that wants to gate an action behind a human-verification
// challenge calls `verifyTurnstile(token)` before proceeding.
//
// Demo mode: when `TURNSTILE_SECRET_KEY` is unset the verification short-
// circuits to success, so the flow works locally / in previews without keys
// (mirroring how Supabase and PayMongo degrade gracefully). The matching
// client widget (`<Turnstile />`) emits a `"demo-bypass"` token in that case.

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Sentinel token emitted by the client widget when running in demo mode. */
export const TURNSTILE_DEMO_TOKEN = "demo-bypass";

/** True when a real Turnstile secret key is configured (production). */
export function isTurnstileConfigured(): boolean {
  return (
    typeof process !== "undefined" &&
    process.env !== undefined &&
    !!process.env.TURNSTILE_SECRET_KEY
  );
}

interface SiteverifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

/**
 * Verify a Turnstile token against Cloudflare's siteverify API.
 *
 * Returns `true` when the challenge is satisfied (or when running in demo
 * mode), `false` otherwise. Never throws — network/parse failures resolve to
 * `false` so callers can simply branch on the boolean.
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<boolean> {
  // Demo mode: no secret configured → accept any (incl. the demo sentinel).
  if (!isTurnstileConfigured()) return true;

  if (!token || typeof token !== "string") return false;
  // A real key is configured, so the demo sentinel is not acceptable.
  if (token === TURNSTILE_DEMO_TOKEN) return false;

  const body = new FormData();
  body.append("secret", process.env.TURNSTILE_SECRET_KEY as string);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);

  try {
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
    if (!res.ok) return false;
    const data = (await res.json()) as SiteverifyResponse;
    return data.success === true;
  } catch {
    return false;
  }
}
