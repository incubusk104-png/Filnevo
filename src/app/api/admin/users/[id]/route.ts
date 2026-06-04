import { NextResponse, type NextRequest } from "next/server";
import { requirePlatformAdmin } from "@/lib/supabase/admin";
import {
  defaultQuotaForTier,
  isSubscriptionStatus,
  isSubscriptionTier,
} from "@/lib/tiers";

export const runtime = "edge";

interface UpdateBody {
  subscription_tier?: string;
  subscription_status?: string;
  monthly_scan_quota?: number;
  is_platform_admin?: boolean;
}

// PATCH /api/admin/users/:id -> update tier / status / quota / admin flag.
// Changing the tier resets monthly_scan_quota to that tier's default unless an
// explicit monthly_scan_quota is also supplied.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await requirePlatformAdmin(req);
  if (ctx instanceof NextResponse) return ctx;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "user_id_required" }, { status: 400 });
  }

  let body: UpdateBody;
  try {
    body = (await req.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};

  if (body.subscription_tier !== undefined) {
    if (!isSubscriptionTier(body.subscription_tier)) {
      return NextResponse.json({ ok: false, error: "invalid_tier" }, { status: 400 });
    }
    update.subscription_tier = body.subscription_tier;
    update.monthly_scan_quota = defaultQuotaForTier(body.subscription_tier);
  }

  if (body.subscription_status !== undefined) {
    if (!isSubscriptionStatus(body.subscription_status)) {
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
    }
    update.subscription_status = body.subscription_status;
  }

  if (body.monthly_scan_quota !== undefined) {
    if (!Number.isInteger(body.monthly_scan_quota) || body.monthly_scan_quota < 0) {
      return NextResponse.json({ ok: false, error: "invalid_quota" }, { status: 400 });
    }
    update.monthly_scan_quota = body.monthly_scan_quota;
  }

  if (body.is_platform_admin !== undefined) {
    if (typeof body.is_platform_admin !== "boolean") {
      return NextResponse.json({ ok: false, error: "invalid_admin_flag" }, { status: 400 });
    }
    update.is_platform_admin = body.is_platform_admin;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: false, error: "no_updatable_fields" }, { status: 400 });
  }

  if (ctx.demo) {
    return NextResponse.json({ ok: true, demo: true, id, applied: update });
  }

  const { data, error } = await ctx.admin!
    .from("user_profiles")
    .update(update)
    .eq("id", id)
    .select("id, subscription_tier, subscription_status, monthly_scan_quota, is_platform_admin")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, user: data });
}
