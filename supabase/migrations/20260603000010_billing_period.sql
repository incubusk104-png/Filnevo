-- Phase A (billing UI) — persist the chosen billing period on the payments
-- ledger so the QR Ph status-poll grant path (and the webhook) can recover
-- whether a checkout was monthly or annual and grant the matching period.
--
-- Seats already landed in 20260603000009; this adds the period dimension. Both
-- are written on the pending ledger row at QR creation and carried to the paid
-- row on confirmation. Defaults to 'monthly' so every existing row / monthly
-- checkout is unchanged. Idempotent (ADD COLUMN IF NOT EXISTS, drop+add CHECK).

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS billing_period TEXT NOT NULL DEFAULT 'monthly';
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_billing_period_check;
ALTER TABLE payments
    ADD CONSTRAINT payments_billing_period_check
    CHECK (billing_period IN ('monthly', 'annual'));
