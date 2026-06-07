# Supabase email templates

Branded HTML for the transactional emails Supabase Auth sends. These are
email-client-safe (table layout + inline styles only).

## `confirm-signup.html` — manual sign-up verification code

This is the email a new user receives after submitting the sign-up form. It
shows the 6-digit code that the **`/login/verify`** page asks for.

### How to apply

1. Supabase dashboard → **Authentication → Providers → Email**: turn
   **"Confirm email" ON** (otherwise Supabase logs the user in immediately at
   sign-up and the verify step is skipped).
2. Supabase dashboard → **Authentication → Email Templates → "Confirm signup"**.
3. Paste the contents of `confirm-signup.html` into the message body.
4. Keep the **`{{ .Token }}`** variable — it renders the 6-digit code. (The
   default Supabase template ships `{{ .ConfirmationURL }}` for a magic link;
   our flow is code-based, so the token is what matters.)
5. Save. Send yourself a test sign-up to confirm delivery.

> Tip: for reliable production delivery, configure custom SMTP under
> **Authentication → SMTP Settings** (e.g. Resend / SendGrid).
