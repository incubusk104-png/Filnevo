// PayMongo client + webhook verification (PH payments via QR Ph only).
//
// Runs on the Edge Runtime, so everything here uses the Web Crypto API
// (`crypto.subtle`) and `fetch` — no Node `crypto`/`Buffer`.
//
// QR Ph is the only supported payment method: customers pay by scanning or
// uploading the dynamic QR in GCash, Maya or any InstaPay-enabled bank app.
// (Hosted checkout — card + e-wallet — is intentionally not offered.)
//
// Demo mode: when PAYMONGO_SECRET_KEY is unset the QR helper returns a stubbed
// placeholder QR so the whole flow builds and works end-to-end without any
// keys. The webhook likewise treats a missing PAYMONGO_WEBHOOK_SECRET as demo
// and skips signature verification.
import { TIERS } from "@/lib/tiers";
import type { SubscriptionTier } from "@/lib/ai/providers";

const PAYMONGO_API = "https://api.paymongo.com/v1";

/** True when a PayMongo secret key is configured (live/test integration). */
export function isPaymongoConfigured(): boolean {
  return !!process.env.PAYMONGO_SECRET_KEY;
}

/** True when a webhook signing secret is configured. */
export function isPaymongoWebhookConfigured(): boolean {
  return !!process.env.PAYMONGO_WEBHOOK_SECRET;
}

// ---------------------------------------------------------------------------
// QR Ph (dynamic) — generate a single-use QR code the customer scans/uploads in
// GCash, Maya or any InstaPay app. Flow (PayMongo Payment Intent workflow):
//   1. create a Payment Intent (amount, metadata) allowing "qrph"
//   2. create a `qrph` Payment Method
//   3. attach it — the response carries the QR image at
//      `next_action.code.image_url` (a base64 PNG data URI)
// PayMongo confirms payment with a `payment.paid` webhook (handled elsewhere);
// the status can also be polled via `getPaymentIntentStatus`.
// ---------------------------------------------------------------------------

export interface QrphPayment {
  /** PayMongo Payment Intent id (pi_...) — `demo_pi_...` in demo mode. */
  paymentIntentId: string;
  /** Base64 PNG data URI of the QR Ph code — render directly in an <img>. */
  qrImageUrl: string;
  /** Amount in PHP (whole pesos). */
  amount: number;
  /** Payment Intent status (e.g. `awaiting_next_action`). */
  status: string;
  /** ISO timestamp when the QR expires (default 30 min from generation). */
  expiresAt: string;
  /** True when this was stubbed because no secret key is set. */
  demo: boolean;
}

export interface CreateQrphArgs {
  tier: SubscriptionTier;
  userId: string;
  email?: string;
}

/** Default QR Ph validity window (PayMongo default is 30 minutes). */
const QRPH_EXPIRY_SECONDS = 30 * 60;

/** A tiny inline-SVG placeholder QR shown in demo mode (no PayMongo key). */
const DEMO_QR_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" fill="#0b1220"/><rect x="24" y="24" width="192" height="192" fill="none" stroke="#2563eb" stroke-width="4" rx="12"/><text x="120" y="118" fill="#e2e8f0" font-family="monospace" font-size="18" text-anchor="middle">DEMO QR</text><text x="120" y="144" fill="#64748b" font-family="monospace" font-size="11" text-anchor="middle">no PayMongo key</text></svg>`,
  );

/** Normalize PayMongo's QR string into a usable <img> src (data URI). */
function toQrDataUri(imageUrl: string): string {
  return imageUrl.startsWith("data:")
    ? imageUrl
    : `data:image/png;base64,${imageUrl}`;
}

/**
 * Generate a dynamic QR Ph code for `tier`. The Payment Intent carries
 * `user_id` + `tier` in metadata so the webhook can attribute the payment. In
 * demo mode (no secret key) a placeholder QR is returned so the UI still works.
 */
export async function createQrphPayment(
  args: CreateQrphArgs,
): Promise<QrphPayment> {
  const { tier, userId } = args;
  const meta = TIERS[tier];
  const amountCentavos = Math.round(meta.pricePhp * 100);
  const expiresAt = new Date(Date.now() + QRPH_EXPIRY_SECONDS * 1000).toISOString();

  if (!isPaymongoConfigured()) {
    return {
      paymentIntentId: `demo_pi_${tier}_${Date.now()}`,
      qrImageUrl: DEMO_QR_DATA_URI,
      amount: meta.pricePhp,
      status: "awaiting_next_action",
      expiresAt,
      demo: true,
    };
  }

  const secret = process.env.PAYMONGO_SECRET_KEY as string;
  const auth = btoa(`${secret}:`);
  const headers = {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
  };

  // 1. Create the Payment Intent (allowing qrph), with attribution metadata.
  const intentRes = await fetch(`${PAYMONGO_API}/payment_intents`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: {
        attributes: {
          amount: amountCentavos,
          currency: "PHP",
          payment_method_allowed: ["qrph"],
          description: `Filnevo ${meta.label} subscription`,
          metadata: { user_id: userId, tier },
        },
      },
    }),
  });
  if (!intentRes.ok) {
    const detail = await intentRes.text();
    throw new Error(`paymongo_qrph_intent_failed: ${intentRes.status} ${detail}`);
  }
  const intentJson = (await intentRes.json()) as {
    data?: { id?: string; attributes?: { client_key?: string } };
  };
  const paymentIntentId = intentJson.data?.id;
  const clientKey = intentJson.data?.attributes?.client_key;
  if (!paymentIntentId || !clientKey) {
    throw new Error("paymongo_qrph_intent_missing_fields");
  }

  // 2. Create a qrph Payment Method.
  const pmRes = await fetch(`${PAYMONGO_API}/payment_methods`, {
    method: "POST",
    headers,
    body: JSON.stringify({ data: { attributes: { type: "qrph" } } }),
  });
  if (!pmRes.ok) {
    const detail = await pmRes.text();
    throw new Error(`paymongo_qrph_pm_failed: ${pmRes.status} ${detail}`);
  }
  const pmJson = (await pmRes.json()) as { data?: { id?: string } };
  const paymentMethodId = pmJson.data?.id;
  if (!paymentMethodId) throw new Error("paymongo_qrph_pm_missing_id");

  // 3. Attach the Payment Method — the QR image comes back in next_action.
  const attachRes = await fetch(
    `${PAYMONGO_API}/payment_intents/${paymentIntentId}/attach`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: { attributes: { payment_method: paymentMethodId, client_key: clientKey } },
      }),
    },
  );
  if (!attachRes.ok) {
    const detail = await attachRes.text();
    throw new Error(`paymongo_qrph_attach_failed: ${attachRes.status} ${detail}`);
  }
  const attachJson = (await attachRes.json()) as {
    data?: {
      attributes?: {
        status?: string;
        next_action?: { code?: { image_url?: string } };
      };
    };
  };
  const attrs = attachJson.data?.attributes;
  const imageUrl = attrs?.next_action?.code?.image_url;
  if (!imageUrl) throw new Error("paymongo_qrph_missing_qr");

  return {
    paymentIntentId,
    qrImageUrl: toQrDataUri(imageUrl),
    amount: meta.pricePhp,
    status: attrs?.status ?? "awaiting_next_action",
    expiresAt,
    demo: false,
  };
}

/**
 * Fetch the current status of a Payment Intent (for polling QR Ph payments).
 * `succeeded` means the customer has paid. Demo mode reports a stable pending
 * status so the UI can render without a backend.
 */
export async function getPaymentIntentStatus(
  paymentIntentId: string,
): Promise<{ status: string; demo: boolean }> {
  if (!isPaymongoConfigured()) {
    return { status: "awaiting_next_action", demo: true };
  }
  const secret = process.env.PAYMONGO_SECRET_KEY as string;
  const auth = btoa(`${secret}:`);
  const res = await fetch(`${PAYMONGO_API}/payment_intents/${paymentIntentId}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`paymongo_intent_status_failed: ${res.status} ${detail}`);
  }
  const json = (await res.json()) as {
    data?: { attributes?: { status?: string } };
  };
  return { status: json.data?.attributes?.status ?? "unknown", demo: false };
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
  paymentIntentId?: string;
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
    paymentIntentId: attrs?.payment_intent_id,
    amount: attrs?.amount,
    metadata: {
      user_id: attrs?.metadata?.user_id,
      tier: attrs?.metadata?.tier,
    },
  };
}
