import { NextResponse, type NextRequest } from "next/server";
import { requirePlatformAdmin } from "@/lib/supabase/admin";

export const runtime = "edge";

const PROFILE_COLUMNS =
  "id, email, display_name, subscription_tier, subscription_status, monthly_scan_quota, scans_used_this_period, total_lifetime_scans, is_platform_admin, created_at";

// Demo fixtures so the admin dashboard renders without a live database.
const DEMO_USERS = [
  {
    id: "demo-1",
    email: "owner@bookkeeper.ph",
    display_name: "Demo Owner",
    subscription_tier: "agency_core",
    subscription_status: "active",
    monthly_scan_quota: 5000,
    scans_used_this_period: 1240,
    total_lifetime_scans: 18230,
    is_platform_admin: true,
    created_at: "2026-01-04T08:00:00Z",
  },
  {
    id: "demo-2",
    email: "solo@freelancecpa.com",
    display_name: "Solo CPA",
    subscription_tier: "starter",
    subscription_status: "active",
    monthly_scan_quota: 50,
    scans_used_this_period: 12,
    total_lifetime_scans: 320,
    is_platform_admin: false,
    created_at: "2026-03-19T10:30:00Z",
  },
  {
    id: "demo-3",
    email: "trial@sandbox.io",
    display_name: "Sandbox Trial",
    subscription_tier: "free",
    subscription_status: "active",
    monthly_scan_quota: 5,
    scans_used_this_period: 5,
    total_lifetime_scans: 5,
    is_platform_admin: false,
    created_at: "2026-05-30T14:05:00Z",
  },
];

// GET /api/admin/users?search=&limit= -> list users (platform admins only)
export async function GET(req: NextRequest) {
  const ctx = await requirePlatformAdmin(req);
  if (ctx instanceof NextResponse) return ctx;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();
  const limit = Math.min(Number(searchParams.get("limit")) || 100, 500);

  if (ctx.demo) {
    const users = search
      ? DEMO_USERS.filter(
          (u) =>
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            (u.display_name ?? "").toLowerCase().includes(search.toLowerCase()),
        )
      : DEMO_USERS;
    return NextResponse.json({ ok: true, demo: true, users: users.slice(0, limit) });
  }

  let query = ctx.admin!
    .from("user_profiles")
    .select(PROFILE_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (search) {
    query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, users: data ?? [] });
}
