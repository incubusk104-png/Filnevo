# AGENT.MD - CAVEAT VAULT SYSTEM
## CURRENT STATUS: [AGENCY-CORE BUILD IN PROGRESS]
## TASK QUEUE (v1 — shipped):
[x] PHASE 1: INFRASTRUCTURE (SQL SCHEMA & RLS) - STATUS: DONE
[x] PHASE 2: DESIGN SYSTEM (OBSIDIAN LEDGER) - STATUS: DONE
[x] PHASE 3: BENTO GRID DASHBOARD - STATUS: DONE
[x] PHASE 4: INTERACTION & BACKEND SYNC - STATUS: DONE
[x] AUTH: Supabase auth + live data wiring (PR #2) - STATUS: DONE

## TASK QUEUE (v2 — Agency-Core, see MASTER_PROJECT_BLUEPRINT.md):
[ ] PHASE A1: WORKSPACES + WORKSPACE-AWARE RLS + TIERED QUOTA - STATUS: PENDING
[ ] PHASE A2: /api/workspaces, APPROVALS, AUDIT ZIP, /api/webhooks - STATUS: PENDING
[ ] PHASE A3: 21st.dev UI (BENTO + WORKSPACE SWITCHER + APPROVAL QUEUE) - STATUS: PENDING

---

## NOTES
- Stack: Next.js 16 (App Router, src dir), TypeScript, Tailwind v4, Supabase/Postgres.
- Lock 1: Next.js Edge rate limiter @ /api/process-document.
- Lock 2: check_and_increment_quota() PL/pgSQL with FOR UPDATE row locks.
- Lock 3: RLS on user_profiles, ai_processing_ledger, expenses.
- UI components sourced via 21st.dev (magic MCP).
