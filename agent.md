# AGENT.MD - CAVEAT VAULT SYSTEM
## CURRENT STATUS: [VERIFYING BUILD]
## TASK QUEUE:
[x] PHASE 1: INFRASTRUCTURE (SQL SCHEMA & RLS) - STATUS: DONE
[x] PHASE 2: DESIGN SYSTEM (OBSIDIAN LEDGER) - STATUS: DONE
[x] PHASE 3: BENTO GRID DASHBOARD - STATUS: DONE
[x] PHASE 4: INTERACTION & BACKEND SYNC - STATUS: DONE

---

## NOTES
- Stack: Next.js 16 (App Router, src dir), TypeScript, Tailwind v4, Supabase/Postgres.
- Lock 1: Next.js Edge rate limiter @ /api/process-document.
- Lock 2: check_and_increment_quota() PL/pgSQL with FOR UPDATE row locks.
- Lock 3: RLS on user_profiles, ai_processing_ledger, expenses.
- UI components sourced via 21st.dev (magic MCP).
