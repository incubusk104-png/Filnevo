import { createClient } from "@/lib/supabase/server";
import {
  DEMO_LEDGER,
  DEMO_METRICS,
  DEMO_QUOTA,
  DEMO_TENANT,
  DEMO_TENANT_ID,
  type LedgerEntry,
  type LedgerStatus,
  type TenantSnapshot,
  type VaultMetrics,
} from "@/lib/vault-data";

export interface VaultData {
  live: boolean;
  tenantId: string;
  email: string | null;
  metrics: VaultMetrics;
  ledger: LedgerEntry[];
  tenant: TenantSnapshot;
  quota: { used: number; limit: number };
}

const DEMO_DATA: VaultData = {
  live: false,
  tenantId: DEMO_TENANT_ID,
  email: null,
  metrics: DEMO_METRICS,
  ledger: DEMO_LEDGER,
  tenant: DEMO_TENANT,
  quota: DEMO_QUOTA,
};

interface ProfileRow {
  id: string;
  tenant_id: string;
  display_name: string | null;
  plan: TenantSnapshot["plan"];
  quota_limit: number;
  quota_used: number;
}

interface LedgerRow {
  id: string;
  document_name: string;
  status: LedgerStatus;
  latency_ms: number;
  tokens: number;
  created_at: string;
}

export async function getVaultData(): Promise<VaultData> {
  const supabase = await createClient();
  if (!supabase) return DEMO_DATA;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEMO_DATA;

  // Ensure a profile row exists for this tenant (first login).
  let { data: profile } = await supabase
    .from("user_profiles")
    .select("id, tenant_id, display_name, plan, quota_limit, quota_used")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (!profile) {
    const { data: created } = await supabase
      .from("user_profiles")
      .insert({ id: user.id, display_name: user.email })
      .select("id, tenant_id, display_name, plan, quota_limit, quota_used")
      .maybeSingle<ProfileRow>();
    profile = created ?? null;
  }

  const { data: ledgerRows } = await supabase
    .from("ai_processing_ledger")
    .select("id, document_name, status, latency_ms, tokens, created_at")
    .order("created_at", { ascending: false })
    .limit(25)
    .returns<LedgerRow[]>();

  const rows = ledgerRows ?? [];
  const total = rows.length;
  const verified = rows.filter((r) => r.status === "verified").length;
  const avgLatency =
    total > 0 ? rows.reduce((s, r) => s + r.latency_ms, 0) / total : 0;

  const tenant: TenantSnapshot = {
    tenantId: profile?.tenant_id ?? user.id,
    displayName: profile?.display_name ?? user.email ?? "Operator",
    plan: profile?.plan ?? "free",
    region: "live · supabase",
    rlsEnforced: true,
  };

  return {
    live: true,
    tenantId: profile?.id ?? user.id,
    email: user.email ?? null,
    metrics: {
      documentsProcessed: total,
      verifiedRatePct: total > 0 ? (verified / total) * 100 : 0,
      avgLatencyMs: avgLatency,
    },
    ledger: rows.map((r) => ({
      id: r.id.slice(0, 8).toUpperCase(),
      document: r.document_name,
      status: r.status,
      latencyMs: r.latency_ms,
      tokens: r.tokens,
      timestamp: new Date(r.created_at).toISOString().slice(0, 19).replace("T", " "),
    })),
    tenant,
    quota: {
      used: profile?.quota_used ?? 0,
      limit: profile?.quota_limit ?? 100,
    },
  };
}
