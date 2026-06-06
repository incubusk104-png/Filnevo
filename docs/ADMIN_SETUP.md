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
PAYMONGO_SECRET_KEY=...              # billing — secret, server-only (see §10)
PAYMONGO_WEBHOOK_SECRET=...          # billing — webhook HMAC secret (see §10)
APP_URL=https://your-domain         # billing — base URL for checkout redirects
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

## 8. Billing — PayMongo (Phase 2)

PH e-wallet billing via **PayMongo** (GCash / Maya / cards). Because PayMongo
e-wallets do not support true card-style auto-recurring charges, this is a
**renew-by-checkout** model: each period the user completes a hosted checkout,
and the `payment.paid` webhook grants the next period. This is the standard
pattern for PH SaaS.

### 8.1 Migration

`20260603000006_billing.sql` adds:
- `user_profiles.current_period_end` — when the current paid period ends.
- `payments` ledger — one row per checkout (`provider`, `provider_ref`,
  `amount`, `status`, `tier`, `period_start/end`). `(provider, provider_ref)`
  is unique so re-delivered webhooks are idempotent. RLS lets a user read only
  their own rows; all writes go through the service role.

Apply with `supabase db push` (idempotent — safe to re-run).

### 8.2 Environment

| Var | Purpose |
|-----|---------|
| `PAYMONGO_SECRET_KEY` | PayMongo secret key (`sk_test_…` / `sk_live_…`). Server-only. |
| `PAYMONGO_WEBHOOK_SECRET` | Webhook signing secret used to verify `Paymongo-Signature`. |
| `APP_URL` | Public base URL for building checkout success/cancel redirects. |

> **Demo mode:** when `PAYMONGO_SECRET_KEY` is unset, `/api/billing/checkout`
> returns a stubbed hosted URL (the local `/billing/success` page) and
> `/api/billing/webhook` skips signature verification. The whole flow builds
> and runs without any keys.

### 8.3 Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/billing/checkout` | Cookie-authed. Body `{ "tier": "starter" \| "business_pro" \| "agency_core" }`. Creates a PayMongo Checkout Session and returns `{ checkout_url }`; metadata carries `user_id` + `tier`. |
| `POST` | `/api/billing/webhook` | PayMongo → us. Verifies the `Paymongo-Signature` HMAC, and on `payment.paid` sets `subscription_tier`, `monthly_scan_quota` (tier default), `subscription_status='active'`, resets the usage counter and stamps the new `current_period_end`. |

### 8.4 Register the webhook

In the PayMongo dashboard → **Developers → Webhooks**, add an endpoint:

```
https://<APP_URL>/api/billing/webhook
```

Subscribe to the `payment.paid` event, copy the generated signing secret into
`PAYMONGO_WEBHOOK_SECRET`, and redeploy. The hosted checkout pages already
offer GCash, Maya and card payments.

---

## 9. Authentication (sign-in / sign-up / Google)

Auth is wired to real Supabase via `@supabase/ssr` cookie sessions. When the
Supabase env is unset the app stays in **demo mode**: `/login` is reachable but
authentication is simulated (mock client).

### 9.1 How it works

- `src/lib/supabase/server.ts` / `client.ts` — real cookie-bound server and
  browser clients (mock fallback in demo).
- `src/middleware.ts` — refreshes the session on each request (Edge runtime;
  kept on the legacy `middleware` convention because Next 16 `proxy` is
  Node-only and Cloudflare Pages requires Edge).
- `src/app/login/actions.ts` — `signIn`, `signUp`, `signInWithGoogle`, `signOut`
  server actions. Inputs validated with `zod`; sign-up enforces the password
  policy server-side.
- `src/app/auth/callback/route.ts` — exchanges the OAuth / email-confirmation
  `code` for a session, then redirects.

### 9.2 Password policy

Defined once in `src/lib/auth/password.ts` and shared by the client strength
meter and the server check: min 10 chars, upper + lowercase, a number, and a
symbol. Sign-up is rejected server-side if the policy is not met.

### 9.3 Enable Google sign-in

The OAuth round-trip is: app → Google → **Supabase** callback → app
`/auth/callback`. Google therefore redirects to **Supabase**, *not* to the app
— the #1 mistake is putting the app URL in "Authorized redirect URIs".

1. **Google Cloud Console** → APIs & Services → Credentials → create (or edit)
   an OAuth 2.0 Client ID, type *Web application*.

   **Authorized JavaScript origins** (scheme + host only, no path, no trailing
   slash) — add each site that initiates sign-in:
   - `https://<your-live-domain>`        e.g. `https://filnevo.pages.dev`
   - `http://localhost:3000`             (local dev — optional)

   **Authorized redirect URIs** (must be the Supabase callback, exactly):
   - `https://<project-ref>.supabase.co/auth/v1/callback`

   `<project-ref>` is the subdomain of your `NEXT_PUBLIC_SUPABASE_URL`
   (e.g. for `https://abcd1234.supabase.co` the ref is `abcd1234`).

2. **Supabase dashboard** → Authentication → Providers → **Google**: paste the
   Client ID + Client Secret and toggle it on.
3. **Supabase** → Authentication → URL Configuration:
   - **Site URL** = your live domain (same as `APP_URL`).
   - **Redirect URLs** allow-list — add both:
     - `https://<your-live-domain>/auth/callback`
     - `http://localhost:3000/auth/callback` (local dev — optional)

No extra app env vars are needed for Google — the provider lives in Supabase.
Set `APP_URL` to the live domain so email-confirmation and checkout redirects
also resolve to production. Manual email/password sign-up works as soon as
Supabase is configured (enable "Confirm email" in Auth settings for
verification).

---

## 10. Build & deploy

```bash
npm install
npm run build         # Next.js production build / type-check
npm run pages:build   # Cloudflare next-on-pages build (must also pass)
```

CI runs both `build` and the Cloudflare Pages build; both must be green.

---

## 11. Known follow-ups (not in this phase)

- **Billing — Stripe (international).** Phase 2 PayMongo (PH: GCash/Maya/cards)
  is implemented (see §8). Next: add Stripe for international cards + true
  card auto-recurring subscriptions.
- **Renewal reminders.** Since PayMongo e-wallets are renew-by-checkout, send a
  reminder as `current_period_end` approaches and downgrade lapsed users.
- **International.** Add a `jurisdiction` concept + generic (non-BIR) categories,
  multi-currency, and RA 10173 / GDPR handling.
