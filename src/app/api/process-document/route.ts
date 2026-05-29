import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { checkAndIncrementQuota, type QuotaResult } from "@/lib/quota";
import { createClient } from "@/lib/supabase/server";

// LOCK 1 runs at the edge, in front of the database.
export const runtime = "edge";

function clientId(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "anonymous";
}

interface QuotaRpcRow {
  allowed: boolean;
  quota_used: number;
  quota_limit: number;
  remaining: number;
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
  const increment = Math.max(1, Number(body.increment ?? 1));

  // --- LOCK 2: atomic quota check ------------------------------------------
  let quota: QuotaResult;
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, lock: 3, error: "unauthenticated" },
        { status: 401 },
      );
    }
    const { data, error } = await supabase.rpc("check_and_increment_quota", {
      p_user_id: user.id,
      p_increment: increment,
    });
    if (error) {
      return NextResponse.json(
        { ok: false, lock: 2, error: error.message },
        { status: 500 },
      );
    }
    const row = (data as QuotaRpcRow[] | null)?.[0];
    quota = {
      allowed: row?.allowed ?? false,
      quotaUsed: row?.quota_used ?? 0,
      quotaLimit: row?.quota_limit ?? 0,
      remaining: row?.remaining ?? 0,
    };
  } else {
    // Demo: in-memory mirror of the PL/pgSQL function.
    quota = checkAndIncrementQuota(body.tenantId ?? id, increment);
  }

  if (!quota.allowed) {
    return NextResponse.json(
      { ok: false, lock: 2, error: "quota_exceeded", quota, alarm: "ruby" },
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
