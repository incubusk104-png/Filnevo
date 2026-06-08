# Supabase auth email templates

Filnevo's auth flows use a **6-digit verification code** (OTP), not magic
links: after an auth action the app sends the user to the in-app Verify
screen, which calls `supabase.auth.verifyOtp(...)`. For that to work, each
auth email must show the code (`{{ .Token }}`). Supabase's default templates
only render a `{{ .ConfirmationURL }}` link, which is why the original emails
arrived branded "Supabase Auth" with a link and no code.

These templates are Filnevo-branded (logo in the upper-left, "Precision
Metrics" colours) and surface the **verification code** prominently, with a
fallback link where Supabase provides one.

## Templates → Supabase mapping

Apply each file in **Dashboard → Authentication → Emails**, pasting the file's
contents into that email's **Message body** source editor.

| Supabase email (in dashboard) | File | Suggested subject |
| --- | --- | --- |
| Confirm sign up | [`confirm-signup.html`](./confirm-signup.html) | `Your Filnevo verification code` |
| Invite user | [`invite-user.html`](./invite-user.html) | `You're invited to Filnevo` |
| Magic Link / OTP | [`magic-link.html`](./magic-link.html) | `Your Filnevo sign-in code` |
| Change email address | [`change-email.html`](./change-email.html) | `Confirm your new Filnevo email` |
| Reset password | [`reset-password.html`](./reset-password.html) | `Reset your Filnevo password` |
| Reauthentication | [`reauthentication.html`](./reauthentication.html) | `Confirm it's you — Filnevo` |

### Steps (per template)
1. Dashboard → **Authentication → Emails** → pick the email above.
2. Set its **Subject** (see table).
3. Open the **Message body** source editor and paste the matching file.
4. Save, then send yourself a test to confirm the code renders.

> Each template keeps a `{{ .ConfirmationURL }}` fallback link where Supabase
> supports one, so either the **code** or the **link** works. The
> **Reauthentication** email is code-only — Supabase does not expose a
> confirmation URL for it.

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
- The **Turnstile** notice hides once `NEXT_PUBLIC_TURNSTILE_SITE_KEY` /
  `TURNSTILE_SECRET_KEY` are set. The site key **must** use the
  `NEXT_PUBLIC_` prefix so Next.js inlines it into the browser bundle at build
  time; otherwise the CAPTCHA can't render.

Set these as environment variables in the Cloudflare Pages project (Production
+ Preview) and redeploy.
