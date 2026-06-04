-- Base schema foundation.
-- IMPORTANT: this migration is intentionally timestamped BEFORE the existing
-- 20260603* migrations so that, on a fresh database, the core tables exist
-- before later migrations ALTER them (add workspace_id) or reference them
-- (workspaces.owner_id -> user_profiles, RLS policies, quota function).
--
-- Every statement is idempotent (IF NOT EXISTS / CREATE OR REPLACE), so applying
-- it to an already-provisioned database is a safe no-op. On an existing project
-- (migrations already at 20260603000004) apply with:
--   supabase db push --include-all
--
-- Design note: user_profiles.id == auth.users.id. The quota function and RLS
-- policies key off `id = auth.uid()`, while the audit export joins on
-- `user_profiles.tenant_id`. We therefore keep tenant_id == id so every existing
-- code path resolves to the same authenticated user.

-- Shared trigger helper (also (re)defined in 20260603000000; CREATE OR REPLACE
-- keeps both idempotent regardless of apply order).
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- user_profiles: one row per authenticated user (PK == auth.users.id)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
    id                     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id              UUID,
    email                  TEXT,
    display_name           TEXT,
    subscription_tier      TEXT NOT NULL DEFAULT 'free'
                               CHECK (subscription_tier IN ('free', 'starter', 'business_pro', 'agency_core')),
    subscription_status    TEXT NOT NULL DEFAULT 'active'
                               CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'suspended')),
    monthly_scan_quota     INT NOT NULL DEFAULT 5,
    scans_used_this_period INT NOT NULL DEFAULT 0,
    total_lifetime_scans   INT NOT NULL DEFAULT 0,
    period_started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_platform_admin      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- ai_processing_ledger: per-document AI processing log
-- (20260603000001 also ADDs workspace_id; harmless no-op once present here)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_processing_ledger (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    workspace_id    UUID,
    document_name   TEXT,
    status          TEXT NOT NULL DEFAULT 'completed',
    approval_status TEXT NOT NULL DEFAULT 'pending'
                        CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    provider        TEXT,
    model           TEXT,
    tokens          INT NOT NULL DEFAULT 0,
    latency_ms      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- expenses: extracted financial line items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    workspace_id UUID,
    vendor       TEXT,
    amount       NUMERIC(14, 2),
    tax_amount   NUMERIC(14, 2),
    currency     TEXT NOT NULL DEFAULT 'PHP',
    bir_category TEXT,
    txn_date     DATE,
    receipt_url  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign-key / lookup indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant ON user_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON ai_processing_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);

-- updated_at maintenance triggers (idempotent via DROP IF EXISTS)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
