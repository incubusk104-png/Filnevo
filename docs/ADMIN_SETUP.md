# Filnevo — Admin & Backend Setup Runbook

Operator guide for standing up the backend, applying migrations, configuring
secrets, and creating the first platform admin. Target audience: you / your ops
person. Aimed at the bookkeeper market (PH + international).

---

## 1. Architecture at a glance

```
Client ─▶ LOCK 1 (edge guard: rate limit + payload cap, in-route)
       ─▶ LOCK 2 (PL/pgSQL check_and_increment_quota: atomic quota + AI routing)
       ─▶ LOCK 3 (Supabase RLS: per-tenant isolation)
```

- **AI routing:** free tier → **Cerebras** `gpt-oss-120b` (zero marginal cost);
  paid tiers (Starter / Business Pro / Agency Core) → **OpenAI** `gpt-4o-mini`.
- **Demo mode:** when `SUPABASE_URL` / `SUPABASE_ANON_KEY` are unset, the app runs
  on simulated data with no auth gate (including the `/admin` console).

---

## 2. Provision Supabase

1. Create a project at https://supabase.com.
2. Note these from **Project Settings → API**:
   - Project URL → `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**secret — server only**)

---

## 3. Apply migrations

Migrations live in `supabase/migrations/`. Order matters:

| File | Purpose |
|------|---------|
| `20260602000000_base_schema.sql` | Base tables: `user_profiles`, `ai_processing_ledger`, `expenses` |
| `20260603000000_setup_database_functions.sql` | `update_updated_at_column()` |
| `20260603000001_add_workspace_support.sql` | `workspaces`, `workspace_members` |
| `20260603000002_update_quota_function.sql` | quota function (superseded by 0004) |
| `20260603000003_add_rls_policies.sql` | LOCK 3 RLS policies |
| `20260603000004_route_cerebras_openai.sql` | LOCK 2 routing: Cerebras/OpenAI |
| `20260603000005_admin_and_auth.sql` | signup trigger, quota reset, admin column |

Using the Supabase CLI:

```bash
supabase link --project-ref <your-ref>
# Fresh project:
supabase db push
# Existing project already at 2026060300000x (applies the earlier-dated base
# migration out of order — every statement is idempotent / IF NOT EXISTS):
supabase db push --include-all
```

> All statements use `CREATE ... IF NOT EXISTS` / `CREATE OR REPLACE` /
> `ADD COLUMN IF NOT EXISTS`, so re-running is safe.

`20260603000005` also installs:
- `handle_new_user()` + `on_auth_user_created` trigger — auto-creates a
  `user_profiles` row (tier `free`, quota 5) on every signup.
- `reset_monthly_quotas()` — zeroes `scans_used_this_period` once a billing
  period elapses. Schedule it (see §6).

---

## 4. Configure environment variables

Set these in your deploy target (Cloudflare Pages → Settings → Environment
variables) and locally in `.env` (never commit real values — see `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # secret, server-only (admin routes)
CEREBRAS_API_KEY=...                 # free-tier extraction
OPENAI_API_KEY=...                   # paid-tier extraction (needs billing)
```

> **OpenAI billing:** a valid key with no credit returns HTTP 429
> `insufficient_quota`. Add credit at https://platform.openai.com/account/billing.

---

## 5. Create the first platform admin

`user_profiles.is_platform_admin` gates the `/admin` console and `/api/admin/*`.
The first admin must be promoted manually (run in the Supabase SQL editor):

```sql
-- 1. Sign the user up normally (via the app /login) so the signup trigger
--    creates their user_profiles row, then promote them:
UPDATE user_profiles
SET is_platform_admin = TRUE
WHERE email = 'you@yourdomain.com';
```

After that, additional admins can be toggled from the `/admin` console UI.

---

## 6. Schedule the monthly quota reset

If the `pg_cron` extension is enabled, `20260603000005` auto-registers a daily
job. To enable/verify:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('filnevo-monthly-quota-reset', '0 0 * * *',
                     'SELECT reset_monthly_quotas();');
SELECT * FROM cron.job;   -- verify
```

No `pg_cron`? Call `reset_monthly_quotas()` from any external scheduler
(GitHub Actions cron, Cloudflare Cron Trigger) against the database.

---

## 7. Admin API reference

All require the caller's Supabase bearer token **and**
`is_platform_admin = true` (in demo mode auth is skipped and sample data is
returned).

| Method | Path | Purpose |
|--------|------|---------|
| `GET`  | `/api/admin/users?search=&limit=` | List/search users |
| `PATCH`| `/api/admin/users/:id` | Update `subscription_tier` / `subscription_status` / `monthly_scan_quota` / `is_platform_admin` |
| `GET`  | `/api/admin/usage` | Totals: users by tier, scans this period, tokens by provider (AI-spend proxy) |

Changing a user's **tier** resets their `monthly_scan_quota` to that tier's
default (Free 5 / Starter 50 / Business Pro 500 / Agency Core 5,000) unless an
explicit `monthly_scan_quota` is included in the same request.

---

## 8. Build & deploy

```bash
npm install
npm run build         # Next.js production build / type-check
npm run pages:build   # Cloudflare next-on-pages build (must also pass)
```

CI runs both `build` and the Cloudflare Pages build; both must be green.

---

## 9. Known follow-ups (not in this phase)

- **Real Supabase session wiring.** Login currently runs through mock clients;
  wire `@supabase/ssr` cookie sessions so production auth (and the admin token
  the `/admin` console sends) is fully live end-to-end.
- **Billing (Phase 2).** PayMongo (PH: GCash/Maya/cards) first, then Stripe
  (international). Webhooks should set `subscription_tier` + `monthly_scan_quota`.
- **International.** Add a `jurisdiction` concept + generic (non-BIR) categories,
  multi-currency, and RA 10173 / GDPR handling.
