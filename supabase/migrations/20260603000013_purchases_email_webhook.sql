-- Transactional purchase email event source.
--
-- Supabase Auth emails stay in Dashboard-managed Auth Templates. Business
-- emails are event-driven: each inserted `purchases` row can be delivered by a
-- Supabase Database Webhook to `handle-purchase-webhook`, which sends via
-- Resend using the service role to resolve profile data.

-- Compatibility profile surface for the Edge Function. The existing app stores
-- profile data in `user_profiles`; the webhook code also supports a real
-- `profiles` table if one exists in another environment.
CREATE OR REPLACE VIEW profiles AS
SELECT
    id,
    email,
    display_name AS full_name
FROM user_profiles;

CREATE TABLE IF NOT EXISTS purchases (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    payment_id    UUID REFERENCES payments(id) ON DELETE SET NULL,
    provider      TEXT NOT NULL DEFAULT 'paymongo',
    provider_ref  TEXT,
    product_name  TEXT NOT NULL DEFAULT 'Filnevo subscription',
    amount        NUMERIC(14, 2) NOT NULL DEFAULT 0,
    currency      TEXT NOT NULL DEFAULT 'PHP',
    status        TEXT NOT NULL DEFAULT 'completed'
                      CHECK (status IN ('pending', 'completed', 'paid', 'failed', 'refunded')),
    metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_created_at
    ON purchases(user_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_purchases_provider_ref
    ON purchases(provider, provider_ref)
    WHERE provider_ref IS NOT NULL;

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS purchases_select_own ON purchases;
CREATE POLICY purchases_select_own ON purchases
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));
