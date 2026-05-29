# MASTER PROJECT BLUEPRINT — CAVEAT VAULT SYSTEM (Full-Stack)

Single source of truth for the unified build: **Triple-Lock Security** + **Agency-Core
feature matrix** + **Classified-Document Dark UI**. Execute phase-by-phase; update
`agent.md` after each phase.

Stack: Next.js 16 (App Router, `src/`), TypeScript, Tailwind v4, Supabase/Postgres.
Runs in **DEMO mode** (simulated data, no auth gate) when `NEXT_PUBLIC_SUPABASE_*` are
unset; enforces auth + live RLS data when they are set. UI components are sourced via the
21st.dev magic MCP and themed to the Obsidian system.

---

## PHASE 1 — HARDENED INFRASTRUCTURE (THE VAULT)
- **Schema:** `user_profiles` (tiered: `subscription_tier`, `monthly_scan_quota`,
  `scans_used_this_period`), `workspaces`, `workspace_members` (role-based),
  workspace-aware `ai_processing_ledger` with an `approval_status`.
- **Lock 1 — Edge gateway:** `proxy.ts` (Next 16) blocks non-compliant traffic + guards routes.
- **Lock 2 — Quota:** `check_and_increment_quota` PL/pgSQL with `FOR UPDATE` row locks,
  tiered limits, monthly rollover.
- **Lock 3 — RLS:** tenant isolation by `auth.uid()` OR workspace membership.

## PHASE 2 — AGENCY-CORE ARCHITECTURE
- **Workspaces:** `/api/workspaces` (list/create) for multi-tenant routing.
- **Approvals (Feat. 11):** ledger `approval_status` = `pending | approved | rejected`;
  `/api/ledger/[id]/approve`.
- **Audit Engine (Feat. 12):** server-side ZIP packaging via `archiver` (Node runtime) at
  `/api/audit/export`.
- **Webhooks:** `POST /api/webhooks` for real-time external sync (HMAC-verified).

## PHASE 3 — "CLASSIFIED-DOCUMENT DARK" FRONTEND (21st.dev)
- **Design tokens:** Obsidian `#080D11` base; Brass-Gold `#B8860B`, Sapphire `#0F52BA`,
  Emerald `#50C878` status variables.
- **Layout:** 3-column Bento Grid dashboard.
- **Interaction:** quota slider → backend; state-driven border-glow alerts
  (Emerald / Amber / Ruby); workspace switcher + approval queue.

---

## OPERATIONAL RULES
- Finish one phase before the next; update `agent.md` (`[x]`) after each.
- If memory/quota limits are reached, auto-commit current state to the git branch.
- Quota exceeded → UI triggers the Ruby Alarm immediately.
