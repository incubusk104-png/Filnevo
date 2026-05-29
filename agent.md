# AGENT.MD - CAVEAT VAULT SYSTEM
## CURRENT STATUS: [COMPLETE — RUNNING & RUNTIME-VERIFIED]
## TASK QUEUE:
[x] PHASE 1: INFRASTRUCTURE (SQL SCHEMA & RLS) - STATUS: DONE
[x] PHASE 2: DESIGN SYSTEM (OBSIDIAN LEDGER) - STATUS: DONE
[x] PHASE 3: BENTO GRID DASHBOARD - STATUS: DONE
[x] PHASE 4: INTERACTION & BACKEND SYNC - STATUS: DONE
[x] RUNTIME: `npm run dev` boots on :3000 - STATUS: DONE

---

## RUNTIME VERIFICATION (2026-05-29)
- `npm run dev` serves the dashboard at http://localhost:3000 (HTTP 200).
- Lock 1+2: POST /api/process-document returns rateLimit + quota, increments atomically.
- Lock 2 breach: dragging the quota slider to 100/100 flips the UI to the RUBY ALARM
  (LOCK BREACH) state with a red pulsing border and 0 remaining.

## NOTES
- Stack: Next.js 16 (App Router, src dir), TypeScript, Tailwind v4, Supabase/Postgres.
- Lock 1: Next.js Edge rate limiter @ /api/process-document.
- Lock 2: check_and_increment_quota() PL/pgSQL with FOR UPDATE row locks.
- Lock 3: RLS on user_profiles, ai_processing_ledger, expenses.
- UI components sourced via 21st.dev (magic MCP).
