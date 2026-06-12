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

## Logo image

The header logo is a hosted image (email clients block inline SVG/data URIs),
referenced as `{{ .SiteURL }}/email-logo.png` in these templates and
`${APP_URL}/email-logo.png` in the checkout confirmation email. To make it
render:

1. Add a transparent-background **PNG** (~240px wide) at
   [`public/email-logo.png`](../../public/email-logo.png) in this repo, so it
   serves from `https://<your-domain>/email-logo.png` after deploy.
2. In Supabase → **Authentication → URL Configuration**, set **Site URL** to
   your live domain (e.g. `https://filnevo.com`) so `{{ .SiteURL }}` resolves.
3. If the image is missing, clients fall back to the `alt="Filnevo"` text.

## Required Supabase Auth settings

Set these before testing registration, otherwise Supabase may send default emails
or skip verification entirely:

1. **Authentication → URL Configuration**
   - **Site URL**: your production website, e.g. `https://filnevo.com`
   - **Redirect URLs**:
     - `https://filnevo.com/auth/callback`
     - `http://localhost:3000/auth/callback` for local testing
2. **Authentication → Providers → Email**
   - Enable **Confirm email**.
   - Filnevo fails closed if Supabase returns an immediate signup session,
     because that means no verification code was required.
3. **Authentication → Emails → SMTP Settings**
   - Configure custom SMTP for production so mail comes from your Filnevo domain
     instead of `Supabase Auth <noreply@mail.app.supabase.io>`.

Google OAuth does not use Filnevo's 6-digit email code; Google verifies the email
at the provider step, then Supabase redirects back through `/auth/callback`.

## Templates → Supabase mapping

Apply each file in **Dashboard → Authentication → Emails**, pasting the file's
contents into that email's **Message body** source editor. These files are the
source of truth for all Supabase authentication and security-related emails.

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
**Authentication → Emails → SMTP Settings**:

- Sender name: `Filnevo`
- Sender email: a verified address on your domain, e.g. `noreply@filnevo.com`
- Reply-to: your support inbox, e.g. `support@filnevo.com`

Custom SMTP is required for production-grade branded delivery.

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
