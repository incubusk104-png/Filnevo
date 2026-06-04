import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientFactory } from "@/lib/mocking/factories";
import { applyEdgeGuard } from "@/lib/rate-limit";
import { FREE_ASSIGNMENT } from "@/lib/ai/providers";

// LOCK 1 runs at the edge, in front of the database.
export const runtime = "edge";

// Keep the clientId function for backward compatibility with LOCK 1 middleware
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
  assigned_provider?: string;
  assigned_model?: string;
}

export async function POST(req: NextRequest) {
  // --- LOCK 1: Edge rate limiter -------------------------------------------
  // Enforce payload-size + per-IP rate limits before touching the DB or any
  // paid AI model. (Runs here, not in a proxy file, because next-on-pages only
  // supports Edge middleware while Next 16 proxy is Node-only.)
  const blocked = applyEdgeGuard(req);
  if (blocked) return blocked;

  const id = clientId(req);

  // --- LOCK 2: atomic quota check (workspace-aware) ------------------------
  let quota: {
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number;
    assigned_provider?: string;
    assigned_model?: string;
  };

  // Extract workspace_id from request if provided (for Agency Core features).
  // Declared in the outer scope so it remains available in the catch block and
  // in the final response below.
  let body: {
    tenantId?: string;
    increment?: number;
    documentName?: string;
    workspaceId?: string;
  } = {};

  try {
    const supabase = await createSupabaseClientFactory();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, lock: 3, error: "unauthenticated" },
        { status: 401 },
      );
    }

    try {
      body = await req.json();
    } catch {
      // empty body is allowed
    }

    const increment = Math.max(1, Number(body.increment ?? 1));
    const workspaceId = body.workspaceId
      ? (typeof body.workspaceId === 'string' ? body.workspaceId : null)
      : null;

    // Call the workspace-aware quota function
    const { data, error } = await supabase.rpc("check_and_increment_quota", {
      p_user_id: user.id,
      p_workspace_id: workspaceId,
      p_requested_batch_size: increment,
    });

    if (error) {
      console.error("Quota function error:", error);
      return NextResponse.json(
        { ok: false, lock: 2, error: "quota_check_failed" },
        { status: 500 }
      );
    }

    const row = (data as QuotaRpcRow[] | null)?.[0];
    quota = {
      allowed: row?.allowed ?? false,
      used: row?.quota_used ?? 0,
      limit: row?.quota_limit ?? 0,
      remaining: row?.remaining ?? 0,
      assigned_provider: row?.assigned_provider,
      assigned_model: row?.assigned_model,
    };

  } catch (error) {
    const fallbackId = body.tenantId ?? id;
    console.error(`Unexpected error in quota check (client=${fallbackId}):`, error);
    // Fallback to demo mode if Supabase is unavailable. Mirror the real routing
    // policy (free tier -> Cerebras) so demo responses match production behaviour.
    quota = {
      allowed: true,
      used: 0,
      limit: 100,
      remaining: 100,
      assigned_provider: FREE_ASSIGNMENT.provider,
      assigned_model: FREE_ASSIGNMENT.model
    };
  }

  if (!quota.allowed) {
    return NextResponse.json(
      {
        ok: false,
        lock: 2,
        error: "quota_exceeded",
        quota,
        // Include assignment info even when denied for debugging
        ...(quota.assigned_provider && { assigned_provider: quota.assigned_provider }),
        ...(quota.assigned_model && { assigned_model: quota.assigned_model })
      },
      {
        status: 402,
        headers: {
          "X-RateLimit-Remaining": String(quota.remaining ?? 0),
          ...(quota.assigned_provider && { "X-Assigned-Provider": quota.assigned_provider }),
          ...(quota.assigned_model && { "X-Assigned-Model": quota.assigned_model })
        }
      }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      documentName: body.documentName ?? null,
      quota,
      // Include the assigned provider/model for transparency
      ...(quota.assigned_provider && { assignedProvider: quota.assigned_provider }),
      ...(quota.assigned_model && { assignedModel: quota.assigned_model })
    },
    {
      headers: {
        "X-RateLimit-Remaining": String(quota.remaining ?? 0),
        ...(quota.assigned_provider && { "X-Assigned-Provider": quota.assigned_provider }),
        ...(quota.assigned_model && { "X-Assigned-Model": quota.assigned_model })
      }
    }
  );
}