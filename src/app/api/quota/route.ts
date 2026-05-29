import { NextRequest, NextResponse } from "next/server";
import { peekQuota, setTenantUsage, checkAndIncrementQuota } from "@/lib/quota";

export const runtime = "edge";

// GET /api/quota?tenantId=... -> current quota snapshot (Lock 2 peek).
export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenantId") ?? "demo-tenant";
  return NextResponse.json({ ok: true, quota: peekQuota(tenantId) });
}

// POST /api/quota -> simulate a usage level (slider) and re-evaluate Lock 2.
export async function POST(req: NextRequest) {
  let body: { tenantId?: string; used?: number; limit?: number; increment?: number } = {};
  try {
    body = await req.json();
  } catch {
    // ignore
  }
  const tenantId = body.tenantId ?? "demo-tenant";

  if (typeof body.used === "number") {
    setTenantUsage(tenantId, body.used, body.limit);
    return NextResponse.json({ ok: true, quota: peekQuota(tenantId) });
  }

  const quota = checkAndIncrementQuota(tenantId, Math.max(1, Number(body.increment ?? 1)));
  return NextResponse.json({ ok: quota.allowed, quota });
}
