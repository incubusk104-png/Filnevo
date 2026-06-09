---
name: testing-billing-checkout
description: Test the Filnevo billing/pricing checkout flow end-to-end (pricing cards, seat selector, monthly/annual toggle, QR Ph checkout, success page). Use when verifying pricing UI or billing checkout changes.
---

# Testing the billing / pricing checkout flow

## Running the app
- `npm run dev` starts the app on `localhost:3000`. With `NEXT_PUBLIC_SUPABASE_*` unset it runs in **demo mode** (no auth gate, mock data) — ideal for testing the pricing/checkout UI without login.

## Reaching the feature
- Landing page `/` → click "Pricing" nav (or scroll to `#pricing`). The 4 standard tier cards render in a grid; the **Agency Core Team** card is a featured full-width card below the grid (`src/components/landing/TeamPlanCard.tsx`).
- The Team card has a monthly/annual toggle + a seat stepper (− / number input / +). Price is computed live by `computeSubscriptionAmountPhp` in `src/lib/tiers.ts`.
- Clicking "Get Agency Core Team" → `/billing/pay?tier=agency_core_team&seats=N&period=P` → the pay page POSTs `/api/billing/qrph` which **re-computes the amount server-side** and returns the QR + amount. Success page is `/billing/success?tier=...&seats=N&period=P`.

## IMPORTANT: Turnstile captcha gates the checkout QR
The pay page (`QrPayment.tsx`) gates QR generation behind a Cloudflare Turnstile widget. The widget needs `NEXT_PUBLIC_TURNSTILE_SITE_KEY` at runtime, and the server (`/api/billing/qrph` → `verifyTurnstile`) **fails closed** without `TURNSTILE_SECRET_KEY`. So in plain demo mode you'll see "Verification couldn't load" and **the QR + server-computed amount never render**.

Workaround (test-only, do NOT commit): start the dev server with Cloudflare's documented always-pass test keys so the widget auto-passes and the server verifies:
```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA \
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA \
npm run dev
```
These require outbound network to `challenges.cloudflare.com`. (If Cloudflare is unreachable in a future environment, the widget may still fail — in that case verify the server amount by other means, e.g. inspecting the `/api/billing/qrph` response.) The header text ("N seats · Annual billing") and the URL params render even without the captcha, since they come from parsing the query string — only the QR + amount are gated.

Note: NEXT_PUBLIC_ vars are read by `next dev` at process start, so set them before launching and relaunch cleanly (kill any existing server on port 3000 first; `lsof` may be unavailable — use `pkill -f "next dev"`).

## Demo mode short-circuits the status poll
In demo mode the QR is a placeholder ("DEMO QR / no PayMongo key") and `QrPayment` skips the status poll (`data.demo` early-returns), so there is **no automatic success redirect**. To verify the success page rendering, navigate directly to `/billing/success?tier=agency_core_team&seats=10&period=annual` (same URL the poll would redirect to). The actual DB seat/period grant is covered by the SQL test suite, not the UI.

## Expected pricing math (agency_core_team)
Base ₱4,999 (5 seats incl.), ₱799/extra seat/mo, annual = ×10 (ANNUAL_MONTHS_CHARGED, i.e. 2 months free). MAX_SEATS = 100, min = baseSeats (5).
- 5 seats monthly = ₱4,999
- 10 seats monthly = 4999 + 5×799 = ₱8,994
- 10 seats annual = ₱89,940/yr (≈ ₱7,495/mo)
- 100 seats monthly = 4999 + 95×799 = ₱80,904

## Good adversarial checks
- Seat floor: − button disabled at 5; price stays ₱4,999.
- Toggle reversibility: annual ↔ monthly updates price both ways.
- Anti-tamper clamp: open `/billing/pay?...&seats=999` — should clamp to 100 seats (proves server/PayContent clamp, not just card local state).
- Single source of truth: the pay-page amount (from the server route) must equal the card's displayed price for the same seats+period.

## Devin Secrets Needed
- None for demo-mode UI testing. The Turnstile keys above are Cloudflare's public always-pass **test** keys, not secrets — fine to hardcode for local testing. Full PayMongo checkout (real QR + paid webhook) would need real `TURNSTILE_*` and PayMongo keys, which are not required for the pricing/seat/period UI flow.
