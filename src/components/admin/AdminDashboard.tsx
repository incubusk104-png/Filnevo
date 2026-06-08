"use client";

import { useCallback, useEffect, useState } from "react";
import { TIERS, TIER_KEYS, SUBSCRIPTION_STATUSES } from "@/lib/tiers";

interface AdminUser {
  id: string;
  email: string | null;
  display_name: string | null;
  subscription_tier: string;
  subscription_status: string;
  monthly_scan_quota: number;
  scans_used_this_period: number;
  total_lifetime_scans: number;
  is_platform_admin: boolean;
  created_at: string;
}

interface UsageSummary {
  totalUsers: number;
  usersByTier: Record<string, number>;
  scansThisPeriod: number;
  tokensByProvider: Record<string, number>;
}

// Best-effort: pull the Supabase access token the browser client persists in
// localStorage (key shaped like `sb-<ref>-auth-token`). Used so production admins
// authenticate to the admin API. In demo mode the API needs no token.
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed?.access_token) return parsed.access_token as string;
      }
    }
  } catch {
    /* ignore parse errors */
  }
  return null;
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getAccessToken();
  return {
    ...(extra ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const STATUS_TONE: Record<string, string> = {
  active: "text-efficiency-green",
  past_due: "text-warning-amber",
  canceled: "text-neutral-400",
  suspended: "text-alert-red",
};

export default function AdminDashboard() {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadUsers = useCallback(async (q: string) => {
    const params = q ? `?search=${encodeURIComponent(q)}` : "";
    const res = await fetch(`/api/admin/users${params}`, { headers: authHeaders() });
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);
    setUsers(json.users ?? []);
    if (json.demo) setDemo(true);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const usageRes = await fetch("/api/admin/usage", { headers: authHeaders() });
      const usageJson = await usageRes.json();
      if (!usageRes.ok || !usageJson.ok) {
        throw new Error(usageJson.error || `HTTP ${usageRes.status}`);
      }
      setSummary(usageJson.summary);
      if (usageJson.demo) setDemo(true);
      await loadUsers("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed_to_load");
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function patchUser(id: string, body: Record<string, unknown>) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);
      await loadUsers(search);
    } catch (e) {
      setError(e instanceof Error ? e.message : "update_failed");
    } finally {
      setSavingId(null);
    }
  }

  const stats: { label: string; value: string }[] = summary
    ? [
        { label: "Total users", value: String(summary.totalUsers) },
        { label: "Scans this period", value: summary.scansThisPeriod.toLocaleString() },
        {
          label: "Cerebras tokens (free)",
          value: (summary.tokensByProvider.cerebras ?? 0).toLocaleString(),
        },
        {
          label: "OpenAI tokens (paid)",
          value: (summary.tokensByProvider.openai ?? 0).toLocaleString(),
        },
      ]
    : [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Platform Admin</span>
            <h1 className="mt-3 font-heading text-3xl md:text-4xl font-bold tracking-tight">
              Admin Console
            </h1>
            <p className="mt-2 text-text-muted">
              Manage users, subscription tiers, quotas, and AI spend.
            </p>
          </div>
          {demo && (
            <span className="rounded-full border border-warning-amber/40 bg-warning-amber/10 px-3 py-1 font-data text-xs text-warning-amber">
              DEMO MODE — sample data
            </span>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-alert-red/40 bg-alert-red/10 px-4 py-3 font-data text-sm text-alert-red">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(loading && stats.length === 0 ? Array.from({ length: 4 }) : stats).map(
            (s, i) => (
              <div
                key={i}
                className="data-card p-6 border border-neutral-800/30 rounded-2xl"
              >
                <p className="font-data text-xs uppercase tracking-wider text-text-muted">
                  {(s as { label?: string })?.label ?? "—"}
                </p>
                <p className="mt-2 font-metrics text-3xl font-semibold text-neutral-100">
                  {(s as { value?: string })?.value ?? "…"}
                </p>
              </div>
            ),
          )}
        </section>

        {/* Tier breakdown */}
        {summary && (
          <section className="mt-6 flex flex-wrap gap-3">
            {TIER_KEYS.map((t) => (
              <div
                key={t}
                className="rounded-xl border border-neutral-800/40 px-4 py-2 font-data text-sm"
              >
                <span className="text-text-muted">{TIERS[t].label}: </span>
                <span className="text-neutral-100">{summary.usersByTier[t] ?? 0}</span>
              </div>
            ))}
          </section>
        )}

        {/* Search */}
        <div className="mt-10 flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") loadUsers(search).catch(() => {});
            }}
            placeholder="Search by email or name…"
            className="w-full max-w-sm rounded-xl border border-neutral-800/50 bg-neutral-900/40 px-4 py-2.5 font-data text-sm text-neutral-100 outline-none focus:border-velocity-blue/60"
          />
          <button
            onClick={() => loadUsers(search).catch(() => {})}
            className="btn-anim press-effect shrink-0 rounded-xl border border-neutral-800/50 px-4 py-2.5 font-data text-sm text-neutral-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-velocity-blue/60 hover:shadow-md hover:shadow-black/30"
          >
            Search
          </button>
        </div>

        {/* Users table */}
        <section className="mt-6 overflow-x-auto rounded-2xl border border-neutral-800/30">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-neutral-900/40 font-data text-xs uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Quota (used / cap)</th>
                <th className="px-4 py-3">Admin</th>
              </tr>
            </thead>
            <tbody className="font-data text-sm">
              {users.map((u) => (
                <tr key={u.id} className="border-t border-neutral-800/30">
                  <td className="px-4 py-3">
                    <div className="text-neutral-100">{u.email ?? "—"}</div>
                    <div className="text-xs text-text-muted">
                      {u.display_name ?? u.id}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      disabled={savingId === u.id}
                      value={u.subscription_tier}
                      onChange={(e) =>
                        patchUser(u.id, { subscription_tier: e.target.value })
                      }
                      className="rounded-lg border border-neutral-800/50 bg-neutral-900/60 px-2 py-1 text-neutral-100 outline-none focus:border-velocity-blue/60"
                    >
                      {TIER_KEYS.map((t) => (
                        <option key={t} value={t}>
                          {TIERS[t].label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      disabled={savingId === u.id}
                      value={u.subscription_status}
                      onChange={(e) =>
                        patchUser(u.id, { subscription_status: e.target.value })
                      }
                      className={`rounded-lg border border-neutral-800/50 bg-neutral-900/60 px-2 py-1 outline-none focus:border-velocity-blue/60 ${
                        STATUS_TONE[u.subscription_status] ?? "text-neutral-100"
                      }`}
                    >
                      {SUBSCRIPTION_STATUSES.map((s) => (
                        <option key={s} value={s} className="text-neutral-100">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-neutral-200">
                    {u.scans_used_this_period.toLocaleString()} /{" "}
                    {u.monthly_scan_quota.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={savingId === u.id}
                      onClick={() =>
                        patchUser(u.id, { is_platform_admin: !u.is_platform_admin })
                      }
                      className={`press-effect rounded-lg border px-2 py-1 text-xs transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 ${
                        u.is_platform_admin
                          ? "border-insight-cyan/50 text-insight-cyan hover:border-insight-cyan"
                          : "border-neutral-800/50 text-text-muted hover:border-velocity-blue/60 hover:text-neutral-200"
                      }`}
                    >
                      {u.is_platform_admin ? "admin" : "make admin"}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
