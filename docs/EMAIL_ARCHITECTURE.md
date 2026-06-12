# Branded email architecture

Filnevo uses a dual-layer email architecture:

1. **Auth layer** — Supabase Auth owns user-created, verification, OTP, invite,
   and password-reset emails. Keep branding by pasting the maintained HTML from
   `supabase/templates/*` into Supabase Dashboard → Authentication → Emails.
2. **Transactional layer** — inserts into `purchases` trigger a Supabase Database
   Webhook that calls `supabase/functions/handle-purchase-webhook`, which sends
   the purchase email through Resend.

## Source components

Reusable React Email layout components live in:

- `src/constants.ts` — `BRAND` source of truth.
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/components/BaseLayout.tsx`

`BaseLayout` uses React Email's `<Tailwind>` component so transactional email
components can be styled with Tailwind-like utility classes before being rendered
to production-safe email HTML.

## Database setup

Apply migrations, including `purchases`:

```sh
supabase db push
```

## Dependency note

The reusable email layout is intentionally dependency-free and uses email-safe
inline table markup so `npm ci` can use the existing lockfile without requiring a
React Email package install.

## Edge Function secrets

Set secrets with the Supabase CLI. Replace placeholders with live values:

```sh
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
supabase secrets set RESEND_FROM="Filnevo <noreply@filnevo.com>"
supabase secrets set APP_URL=https://filnevo.com
supabase secrets set PURCHASE_WEBHOOK_SECRET=replace-with-a-long-random-secret
```

`PURCHASE_WEBHOOK_SECRET` is optional in code but recommended in production. Add
it as either an `Authorization: Bearer ...` header or `x-webhook-secret` header
on the Supabase Database Webhook.

## Deploy the Edge Function

The Database Webhook is a server-to-server call, so deploy without Supabase JWT
verification and protect the function with `PURCHASE_WEBHOOK_SECRET` instead:

```sh
supabase functions deploy handle-purchase-webhook --no-verify-jwt
```

The deployed URL is:

```text
https://YOUR_PROJECT_REF.supabase.co/functions/v1/handle-purchase-webhook
```

## Wire the Database Webhook

In Supabase Dashboard:

1. Go to **Database → Webhooks**.
2. Click **Create a new webhook**.
3. Set **Name** to `purchase-email`.
4. Set **Table** to `public.purchases`.
5. Enable only the **Insert** event.
6. Set **Type** to **HTTP Request**.
7. Set **Method** to `POST`.
8. Set **URL** to:

   ```text
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/handle-purchase-webhook
   ```

9. Add one of these headers:

   ```text
   Authorization: Bearer YOUR_PURCHASE_WEBHOOK_SECRET
   ```

   or:

   ```text
   x-webhook-secret: YOUR_PURCHASE_WEBHOOK_SECRET
   ```

10. Save the webhook.

## Smoke test

Insert a completed purchase for an existing user profile:

```sql
INSERT INTO purchases (user_id, product_name, amount, currency, status, provider_ref)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Filnevo Business Pro',
  1499,
  'PHP',
  'completed',
  'manual-smoke-test-001'
);
```

Use a real `user_id` from `user_profiles` with a valid `email` value.
