export type LedgerStatus = "verified" | "pending" | "failed";

export interface LedgerEntry {
  id: string;
  document: string;
  status: LedgerStatus;
  latencyMs: number;
  tokens: number;
  timestamp: string;
}

export interface VaultMetrics {
  documentsProcessed: number;
  verifiedRatePct: number;
  avgLatencyMs: number;
}

export interface TenantSnapshot {
  tenantId: string;
  displayName: string;
  plan: "free" | "pro" | "enterprise";
  region: string;
  rlsEnforced: boolean;
}

export const DEMO_TENANT_ID = "demo-tenant";

export const DEMO_QUOTA = { used: 64, limit: 100 };

export const DEMO_TENANT: TenantSnapshot = {
  tenantId: "c0ffee00-1ab2-4c3d-9e8f-aa11bb22cc33",
  displayName: "Vault Operator",
  plan: "pro",
  region: "us-east-1 · edge",
  rlsEnforced: true,
};

export const DEMO_METRICS: VaultMetrics = {
  documentsProcessed: 1284,
  verifiedRatePct: 98.6,
  avgLatencyMs: 0.84,
};

export const DEMO_LEDGER: LedgerEntry[] = [
  { id: "TX-9F2A", document: "acquisition-caveat-014.pdf", status: "verified", latencyMs: 0.71, tokens: 1820, timestamp: "2026-05-29 03:48:02" },
  { id: "TX-9F29", document: "tenant-isolation-audit.docx", status: "verified", latencyMs: 0.66, tokens: 940, timestamp: "2026-05-29 03:47:11" },
  { id: "TX-9F28", document: "rls-policy-review.md", status: "pending", latencyMs: 1.12, tokens: 0, timestamp: "2026-05-29 03:46:55" },
  { id: "TX-9F27", document: "quota-ledger-export.csv", status: "verified", latencyMs: 0.59, tokens: 3110, timestamp: "2026-05-29 03:45:30" },
  { id: "TX-9F26", document: "breach-sim-replay.json", status: "failed", latencyMs: 2.04, tokens: 0, timestamp: "2026-05-29 03:44:09" },
  { id: "TX-9F25", document: "edge-ratelimit-trace.log", status: "verified", latencyMs: 0.48, tokens: 220, timestamp: "2026-05-29 03:43:51" },
  { id: "TX-9F24", document: "obsidian-design-spec.pdf", status: "verified", latencyMs: 0.77, tokens: 1455, timestamp: "2026-05-29 03:42:18" },
];
