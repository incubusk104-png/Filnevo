# Supabase auth email templates

Filnevo's sign-up flow uses a **6-digit verification code** (OTP), not a magic
link: after `supabase.auth.signUp(...)` the app sends the user to the in-app
Verify screen, which calls `supabase.auth.verifyOtp({ type: "signup" })`.

For that to work, the **Confirm signup** email must show the code
(`{{ .Token }}`). Supabase's default template only renders a
`{{ .ConfirmationURL }}` link, which is why the email arrived branded
"Supabase Auth" with a confirm link and no code.

## Apply the Filnevo template

1. Supabase Dashboard → **Authentication → Emails → Confirm signup**.
2. Set **Subject** to e.g. `Your Filnevo verification code`.
3. Open the **Message body** source editor and paste the contents of
   [`confirm-signup.html`](./confirm-signup.html).
4. Save. Send yourself a test sign-up to confirm the code renders.

> The template keeps a `{{ .ConfirmationURL }}` fallback link as well, so either
> the code **or** the link will confirm the address.

## Sender identity (remove the "Supabase Auth" branding)

The "Supabase Auth · noreply@mail.app.supabase.io" sender comes from Supabase's
shared SMTP. To send as Filnevo, configure **custom SMTP** in
**Authentication → Emails → SMTP Settings** (set sender name `Filnevo` and your
own from-address/domain). Custom SMTP is required for production-grade delivery.

## Remove demo notices

The in-app "Demo mode" notices are conditional and disappear automatically once
the relevant service is configured:

- **Supabase** notices (`Demo mode — sign-in is simulated…`) hide when
  `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and the
  server-side `SUPABASE_URL` / `SUPABASE_ANON_KEY`) are set.
- The **Turnstile** "Verification (demo) — CAPTCHA auto-approved…" notice hides
  once `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` are set.

Set these as environment variables in the Cloudflare Pages project (Production
+ Preview) and redeploy.
