import { NextResponse, type NextRequest } from "next/server";
import { requirePlatformAdmin } from "@/lib/supabase/admin";
import { TIER_KEYS } from "@/lib/tiers";

export const runtime = "edge";

interface UsageSummary {
  totalUsers: number;
  usersByTier: Record<string, number>;
  scansThisPeriod: number;
  tokensByProvider: Record<string, number>;
}

const DEMO_SUMMARY: UsageSummary = {
  totalUsers: 3,
  usersByTier: { free: 1, starter: 1, business_pro: 0, agency_core: 1, agency_core_team: 0 },
  scansThisPeriod: 1257,
  tokensByProvider: { cerebras: 84210, openai: 1903400 },
};

// GET /api/admin/usage -> platform-wide usage + AI spend proxy (token counts).
export async function GET(req: NextRequest) {
  const ctx = await requirePlatformAdmin(req);
  if (ctx instanceof NextResponse) return ctx;

  if (ctx.demo) {
    return NextResponse.json({ ok: true, demo: true, summary: DEMO_SUMMARY });
  }

  const admin = ctx.admin!;

  const { data: profiles, error: profErr } = await admin
    .from("user_profiles")
    .select("subscription_tier, scans_used_this_period")
    .limit(10000);
  if (profErr) {
    return NextResponse.json({ ok: false, error: profErr.message }, { status: 500 });
  }

  const usersByTier: Record<string, number> = Object.fromEntries(
    TIER_KEYS.map((t) => [t, 0]),
  );
  let scansThisPeriod = 0;
  for (const p of profiles ?? []) {
    const tier = (p.subscription_tier as string) ?? "free";
    usersByTier[tier] = (usersByTier[tier] ?? 0) + 1;
    scansThisPeriod += (p.scans_used_this_period as number) ?? 0;
  }

  const { data: ledger, error: ledgerErr } = await admin
    .from("ai_processing_ledger")
    .select("provider, tokens")
    .limit(50000);
  if (ledgerErr) {
    return NextResponse.json({ ok: false, error: ledgerErr.message }, { status: 500 });
  }

  const tokensByProvider: Record<string, number> = {};
  for (const row of ledger ?? []) {
    const provider = (row.provider as string) ?? "unknown";
    tokensByProvider[provider] =
      (tokensByProvider[provider] ?? 0) + ((row.tokens as number) ?? 0);
  }

  const summary: UsageSummary = {
    totalUsers: profiles?.length ?? 0,
    usersByTier,
    scansThisPeriod,
    tokensByProvider,
  };
  return NextResponse.json({ ok: true, summary });
}
