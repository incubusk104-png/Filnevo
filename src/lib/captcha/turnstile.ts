// Cloudflare Turnstile — server-side token verification.
//
// This is the server half of the reusable CAPTCHA "template": any route or
// server action that wants to gate an action behind a human-verification
// challenge calls `verifyTurnstile(token)` before proceeding.
//
// There is no demo bypass: verification always goes through Cloudflare. If the
// secret key is not configured the check fails CLOSED (returns false) so a
// misconfiguration can never silently let unverified traffic through. For local
// development use Cloudflare's always-pass test keys
// (site `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`).

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** True when a real Turnstile secret key is configured. */
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
 * Returns `true` only when the challenge is satisfied. Fails closed: a missing
 * secret, a missing token, or any network/parse failure resolves to `false`,
 * so callers can simply branch on the boolean.
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<boolean> {
  // Fail closed when the secret is absent — never auto-approve.
  if (!isTurnstileConfigured()) return false;
  if (!token || typeof token !== "string") return false;

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
