// PayMongo client + webhook verification (PH e-wallets: GCash / Maya / cards).
//
// Runs on the Edge Runtime, so everything here uses the Web Crypto API
// (`crypto.subtle`) and `fetch` — no Node `crypto`/`Buffer`.
//
// Demo mode: when PAYMONGO_SECRET_KEY is unset the checkout helper returns a
// stubbed hosted URL (pointing back at our own success page) so the whole flow
// builds and works end-to-end without any keys. The webhook likewise treats a
// missing PAYMONGO_WEBHOOK_SECRET as demo and skips signature verification.
import { TIERS } from "@/lib/tiers";
import type { SubscriptionTier } from "@/lib/ai/providers";

const PAYMONGO_API = "https://api.paymongo.com/v1";

/** PayMongo supports GCash, Maya and cards for hosted checkout in PH. */
const PAYMENT_METHOD_TYPES = ["gcash", "paymaya", "card"] as const;

/** True when a PayMongo secret key is configured (live/test integration). */
export function isPaymongoConfigured(): boolean {
  return !!process.env.PAYMONGO_SECRET_KEY;
}

/** True when a webhook signing secret is configured. */
export function isPaymongoWebhookConfigured(): boolean {
  return !!process.env.PAYMONGO_WEBHOOK_SECRET;
}

/**
 * Resolve the public base URL used to build success/cancel redirects.
 *
 * Order of preference:
 *  1. `APP_URL` env (explicit, deterministic — recommended in production).
 *  2. The live origin derived from the incoming request headers
 *     (`x-forwarded-host`/`host` + `x-forwarded-proto`), so a deployed site
 *     never falls back to localhost even when `APP_URL` is unset.
 *  3. `http://localhost:3000` for local dev.
 */
export function appBaseUrl(headers?: Headers): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (headers) {
    const host = headers.get("x-forwarded-host") ?? headers.get("host");
    if (host) {
      const proto = headers.get("x-forwarded-proto") ?? "https";
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  }
  return "http://localhost:3000";
}

export interface CheckoutSession {
  /** PayMongo Checkout Session id (cs_...) — `demo_...` in demo mode. */
  id: string;
  /** Hosted page the user is redirected to in order to pay. */
  checkoutUrl: string;
  /** True when this session was stubbed because no secret key is set. */
  demo: boolean;
}

export interface CreateCheckoutArgs {
  tier: SubscriptionTier;
  userId: string;
  email?: string;
  /**
   * Public base URL for the success/cancel redirects. Pass the request-derived
   * origin from the route so deployed checkouts return to the live site rather
   * than localhost. Falls back to `appBaseUrl()` when omitted.
   */
  baseUrl?: string;
}

/**
 * Create a PayMongo Checkout Session for `tier`. The session carries
 * `user_id` + `tier` in metadata so the webhook can attribute the payment back
 * to the buyer. In demo mode a fake session pointing at our own success page is
 * returned so the redirect flow still works without keys.
 */
export async function createCheckoutSession(
  args: CreateCheckoutArgs,
): Promise<CheckoutSession> {
  const { tier, userId, email } = args;
  const meta = TIERS[tier];
  const base = (args.baseUrl ?? appBaseUrl()).replace(/\/$/, "");
  const successUrl = `${base}/billing/success?tier=${tier}`;
  const cancelUrl = `${base}/?billing=cancelled#pricing`;

  if (!isPaymongoConfigured()) {
    // Demo: hand back a stubbed session id + a URL that lands on our own
    // success page, so the UI redirect can be exercised without PayMongo.
    return {
      id: `demo_${tier}_${Date.now()}`,
      checkoutUrl: `${successUrl}&demo=1`,
      demo: true,
    };
  }

  const secret = process.env.PAYMONGO_SECRET_KEY as string;
  // PayMongo uses HTTP Basic auth: the secret key as the username, no password.
  const auth = btoa(`${secret}:`);

  const payload = {
    data: {
      attributes: {
        // Amounts are in the smallest currency unit (centavos).
        line_items: [
          {
            name: `Filnevo ${meta.label}`,
            amount: Math.round(meta.pricePhp * 100),
            currency: "PHP",
            quantity: 1,
          },
        ],
        payment_method_types: [...PAYMENT_METHOD_TYPES],
        description: `Filnevo ${meta.label} subscription`,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { user_id: userId, tier },
        ...(email ? { customer_email: email } : {}),
      },
    },
  };

  const res = await fetch(`${PAYMONGO_API}/checkout_sessions`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`paymongo_checkout_failed: ${res.status} ${detail}`);
  }

  const json = (await res.json()) as {
    data?: { id?: string; attributes?: { checkout_url?: string } };
  };
  const id = json.data?.id;
  const checkoutUrl = json.data?.attributes?.checkout_url;
  if (!id || !checkoutUrl) {
    throw new Error("paymongo_checkout_missing_url");
  }

  return { id, checkoutUrl, demo: false };
}

// ---------------------------------------------------------------------------
// Webhook signature verification.
//
// PayMongo signs each delivery with a `Paymongo-Signature` header shaped like:
//   t=<unix_ts>,te=<test_mode_sig>,li=<live_mode_sig>
// The signature is HMAC-SHA256 of `"<t>.<rawBody>"` using the webhook secret,
// hex-encoded. We accept a match against either the test or live signature.
// ---------------------------------------------------------------------------

interface ParsedSignature {
  timestamp: string;
  test?: string;
  live?: string;
}

export function parseSignatureHeader(header: string): ParsedSignature | null {
  const parts = header.split(",");
  const out: Partial<ParsedSignature> = {};
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "t") out.timestamp = value;
    else if (key === "te") out.test = value;
    else if (key === "li") out.live = value;
  }
  if (!out.timestamp || (!out.test && !out.live)) return null;
  return out as ParsedSignature;
}

async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time string comparison (avoids signature timing oracles). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Verify a PayMongo webhook signature against the raw request body.
 * Returns true when the HMAC matches the test or live signature.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader) return false;
  const parsed = parseSignatureHeader(signatureHeader);
  if (!parsed) return false;

  const expected = await hmacSha256Hex(secret, `${parsed.timestamp}.${rawBody}`);
  if (parsed.test && timingSafeEqual(expected, parsed.test)) return true;
  if (parsed.live && timingSafeEqual(expected, parsed.live)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Webhook event shape (only the fields we consume).
// ---------------------------------------------------------------------------

export interface PaymongoEvent {
  type: string; // e.g. "payment.paid"
  paymentId?: string;
  checkoutSessionId?: string;
  amount?: number; // centavos
  metadata: { user_id?: string; tier?: string };
}

/**
 * Extract the bits we care about from a PayMongo webhook payload. PayMongo
 * nests the resource under data.attributes.data.attributes; metadata may live
 * on the payment, the source, or the originating checkout session.
 */
export function parseWebhookEvent(payload: unknown): PaymongoEvent {
  const root = payload as {
    data?: {
      attributes?: {
        type?: string;
        data?: {
          id?: string;
          attributes?: {
            amount?: number;
            metadata?: Record<string, string>;
            checkout_session_id?: string;
            payment_intent_id?: string;
          };
        };
      };
    };
  };

  const event = root.data?.attributes;
  const resource = event?.data;
  const attrs = resource?.attributes;

  return {
    type: event?.type ?? "",
    paymentId: resource?.id,
    checkoutSessionId: attrs?.checkout_session_id,
    amount: attrs?.amount,
    metadata: {
      user_id: attrs?.metadata?.user_id,
      tier: attrs?.metadata?.tier,
    },
  };
}
