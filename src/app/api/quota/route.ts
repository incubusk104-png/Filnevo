import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientFactory } from "@/lib/mocking/factories";

// GET /api/quota?tenantId=... -> current quota snapshot (Lock 2 peek).
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseClientFactory();
  if (!supabase) {
    // Fallback to demo mode
    const tenantId = req.nextUrl.searchParams.get("tenantId") ?? "demo-tenant";
    // This would normally call a mock peekQuota function
    return NextResponse.json({
      ok: true,
      quota: {
        allowed: true,
        used: 0,
        limit: 100,
        remaining: 100
      }
    });
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
    }

    // For quota checking, we need to call an RPC function
    // Since we don't have a peekQuota RPC yet, we'll return a basic response
    // In production, you'd want to create a get_user_quota RPC function
    return NextResponse.json({
      ok: true,
      quota: {
        allowed: true,
        used: 0, // Would come from DB
        limit: 100, // Would come from user's tier
        remaining: 100
      }
    });
  } catch (error) {
    console.error("Quota fetch error:", error);
    return NextResponse.json({
      ok: false,
      error: "failed_to_fetch_quota"
    }, { status: 500 });
  }
}

// POST /api/quota -> simulate a usage level (slider) and re-evaluate Lock 2.
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseClientFactory();
  if (!supabase) {
    // Fallback to demo mode
    let body: { tenantId?: string; used?: number; limit?: number; increment?: number } = {};
    try {
      body = await req.json();
    } catch {
      // ignore
    }
    const tenantId = body.tenantId ?? "demo-tenant";

    if (typeof body.used === "number") {
      // This would normally call setTenantUsage
      return NextResponse.json({
        ok: true,
        quota: {
          allowed: body.used < (body.limit ?? 100),
          used: body.used ?? 0,
          limit: body.limit ?? 100,
          remaining: Math.max(0, (body.limit ?? 100) - (body.used ?? 0))
        }
      });
    }

    const increment = Math.max(1, Number(body.increment ?? 1));
    // This would normally call checkAndIncrementQuota
    // For now, return a mock allowed response
    return NextResponse.json({
      ok: true,
      quota: {
        allowed: true,
        used: 0, // Would be incremented in real implementation
        limit: 100,
        remaining: 100 - increment
      }
    });
  }

  try {
    let body: { tenantId?: string; used?: number; limit?: number; increment?: number } = {};
    try {
      body = await req.json();
    } catch {
      // ignore
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
    }

    if (typeof body.used === "number") {
      // In a real implementation, you'd update the user's quota usage via RPC
      // For now, we'll acknowledge the request
      return NextResponse.json({ ok: true });
    }

    const increment = Math.max(1, Number(body.increment ?? 1));
    // In a real implementation, you'd call check_and_increment_quota RPC
    // For now, return a mock allowed response
    return NextResponse.json({
      ok: true,
      quota: {
        allowed: true,
        used: 0, // Would come from DB after increment
        limit: 100, // Would come from user's tier
        remaining: 90 // Example after increment
      }
    });
  } catch (error) {
    console.error("Quota update error:", error);
    return NextResponse.json({
      ok: false,
      error: "failed_to_update_quota"
    }, { status: 500 });
  }
}