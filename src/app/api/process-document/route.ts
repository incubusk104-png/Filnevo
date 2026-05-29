import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { checkAndIncrementQuota } from "@/lib/quota";

// LOCK 1 runs at the edge, in front of the database.
export const runtime = "edge";

function clientId(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "anonymous";
}

export async function POST(req: NextRequest) {
  // --- LOCK 1: Edge rate limiter -------------------------------------------
  const id = clientId(req);
  const rl = rateLimit(id);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, lock: 1, error: "rate_limited", retryAfterMs: rl.resetMs },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(rl.limit),
          "X-RateLimit-Remaining": String(rl.remaining),
          "Retry-After": String(Math.ceil(rl.resetMs / 1000)),
        },
      },
    );
  }

  let body: { tenantId?: string; increment?: number; documentName?: string } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is allowed
  }
  const tenantId = body.tenantId ?? id;
  const increment = Math.max(1, Number(body.increment ?? 1));

  // --- LOCK 2: atomic quota check ------------------------------------------
  // With Supabase configured this becomes an RPC to check_and_increment_quota
  // (FOR UPDATE). Here we mirror it in-memory for the demo.
  const quota = checkAndIncrementQuota(tenantId, increment);
  if (!quota.allowed) {
    return NextResponse.json(
      {
        ok: false,
        lock: 2,
        error: "quota_exceeded",
        quota,
        alarm: "ruby",
      },
      {
        status: 402,
        headers: { "X-RateLimit-Remaining": String(rl.remaining) },
      },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      documentName: body.documentName ?? null,
      quota,
      rateLimit: { remaining: rl.remaining, limit: rl.limit },
    },
    { headers: { "X-RateLimit-Remaining": String(rl.remaining) } },
  );
}
