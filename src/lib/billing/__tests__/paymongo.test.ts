import {
  createQrphPayment,
  getPaymentIntentStatus,
  parseSignatureHeader,
  parseWebhookEvent,
  verifyWebhookSignature,
} from "../paymongo";

const originalEnv = process.env;

// Recreate the exact signing scheme PayMongo uses so we can mint a valid
// signature in the test: HMAC-SHA256(secret, `${t}.${rawBody}`), hex-encoded.
async function sign(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

describe("paymongo", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });
  afterAll(() => {
    process.env = originalEnv;
  });

  describe("parseSignatureHeader", () => {
    it("parses t/te/li parts", () => {
      const parsed = parseSignatureHeader("t=123,te=abc,li=def");
      expect(parsed).toEqual({ timestamp: "123", test: "abc", live: "def" });
    });

    it("returns null when no signature value present", () => {
      expect(parseSignatureHeader("t=123")).toBeNull();
    });
  });

  describe("verifyWebhookSignature", () => {
    const secret = "whsec_test";
    const body = JSON.stringify({ data: { attributes: { type: "payment.paid" } } });

    it("accepts a valid test-mode signature", async () => {
      const t = "1700000000";
      const sig = await sign(secret, `${t}.${body}`);
      const header = `t=${t},te=${sig}`;
      expect(await verifyWebhookSignature(body, header, secret)).toBe(true);
    });

    it("accepts a valid live-mode signature", async () => {
      const t = "1700000000";
      const sig = await sign(secret, `${t}.${body}`);
      const header = `t=${t},li=${sig}`;
      expect(await verifyWebhookSignature(body, header, secret)).toBe(true);
    });

    it("rejects a tampered body", async () => {
      const t = "1700000000";
      const sig = await sign(secret, `${t}.${body}`);
      const header = `t=${t},te=${sig}`;
      expect(await verifyWebhookSignature(body + "x", header, secret)).toBe(false);
    });

    it("rejects the wrong secret", async () => {
      const t = "1700000000";
      const sig = await sign(secret, `${t}.${body}`);
      const header = `t=${t},te=${sig}`;
      expect(await verifyWebhookSignature(body, header, "whsec_wrong")).toBe(false);
    });

    it("rejects a missing signature header", async () => {
      expect(await verifyWebhookSignature(body, null, secret)).toBe(false);
    });
  });

  describe("parseWebhookEvent", () => {
    it("extracts type, amount and metadata", () => {
      const payload = {
        data: {
          attributes: {
            type: "payment.paid",
            data: {
              id: "pay_123",
              attributes: {
                amount: 29900,
                checkout_session_id: "cs_abc",
                metadata: { user_id: "u-1", tier: "starter" },
              },
            },
          },
        },
      };
      expect(parseWebhookEvent(payload)).toEqual({
        type: "payment.paid",
        paymentId: "pay_123",
        checkoutSessionId: "cs_abc",
        paymentIntentId: undefined,
        amount: 29900,
        metadata: { user_id: "u-1", tier: "starter" },
      });
    });

    it("extracts the payment_intent_id (QR Ph payments)", () => {
      const payload = {
        data: {
          attributes: {
            type: "payment.paid",
            data: {
              id: "pay_456",
              attributes: { amount: 249900, payment_intent_id: "pi_xyz" },
            },
          },
        },
      };
      expect(parseWebhookEvent(payload).paymentIntentId).toBe("pi_xyz");
    });
  });

  describe("createQrphPayment (demo)", () => {
    it("returns a placeholder QR when no secret key is set", async () => {
      delete process.env.PAYMONGO_SECRET_KEY;
      const qr = await createQrphPayment({ tier: "agency_core", userId: "u-1" });
      expect(qr.demo).toBe(true);
      expect(qr.paymentIntentId).toContain("demo_pi_");
      expect(qr.qrImageUrl).toContain("data:image/svg+xml");
      expect(qr.amount).toBe(2499);
      expect(typeof qr.expiresAt).toBe("string");
    });
  });

  describe("getPaymentIntentStatus (demo)", () => {
    it("reports a pending status without a secret key", async () => {
      delete process.env.PAYMONGO_SECRET_KEY;
      const res = await getPaymentIntentStatus("demo_pi_x");
      expect(res).toEqual({ status: "awaiting_next_action", demo: true });
    });
  });
});
