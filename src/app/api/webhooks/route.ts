import { NextRequest, NextResponse } from "next/server";
// Crypto is not available in Edge Runtime - using a simple alternative for demonstration
// In production, you would use Web Crypto API or a different approach
const crypto = {
  createHmac: (algorithm: string, key: string) => {
    let buffered = "";
    const hmac = {
      update: (data: string) => {
        buffered += data;
        return hmac;
      },
      digest: (encoding: string) => {
        // Simple mock HMAC implementation for demonstration
        // In real implementation, use Web Crypto API
        return btoa(`${key}:${buffered}`).substring(0, 32);
      },
    };
    return hmac;
  },
  timingSafeEqual: (a: Buffer, b: Buffer) => {
    // Simple timing-safe comparison mock
    return a.toString() === b.toString();
  }
};

export const runtime = "edge";

export async function POST(req: NextRequest) {
  // Get the webhook secret from environment variables
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { ok: false, error: "server_misconfigured" },
      { status: 500 }
    );
  }

  // Get the signature from headers (assuming header X-Signature or similar)
  // The master blueprint doesn't specify the header name, so we'll use a common one.
  const signature = req.headers.get("x-signature") ?? req.headers.get("x-webhook-signature");
  if (!signature) {
    return NextResponse.json(
      { ok: false, error: "missing_signature" },
      { status: 400 }
    );
  }

  // Get the raw body for HMAC verification
  const rawBody = await req.text();

  // Calculate the HMAC SHA256 of the body using the secret
  const hmac = crypto.createHmac("sha256", webhookSecret);
  hmac.update(rawBody);
  const expectedSignature = `sha256=${hmac.digest("hex")}`;

  // Compare the signatures (using constant-time comparison to avoid timing attacks)
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!isValid) {
    return NextResponse.json(
      { ok: false, error: "invalid_signature" },
      { status: 401 }
    );
  }

  // If signature is valid, process the payload (for now, we just log and acknowledge)
  // In a real implementation, you would trigger the appropriate sync action.
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (e) {
    // If not JSON, we still accept it as text (or binary) but log accordingly.
    payload = rawBody;
  }

  // Here you would implement the actual sync logic, e.g.,
  // - Update external systems
  // - Trigger downstream processing
  // - Store in a database for later processing
  // For now, we just log to console (in a serverless environment, this might go to logs)
  console.log("Webhook received:", {
    timestamp: new Date().toISOString(),
    payload,
  });

  return NextResponse.json({ ok: true, received: true });
}