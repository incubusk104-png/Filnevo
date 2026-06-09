-- Phase 2 (billing) — DB-level "apply the paid plan" trigger.
--
-- The PayMongo webhook (`/api/billing/webhook`) and the QR Ph status poll both
-- call applyPaidUpgrade() in app code to grant access. This trigger adds a
-- defence-in-depth layer at the DATABASE: whenever a `payments` row becomes
-- `paid`, the owning user is upgraded automatically — so access is granted even
-- if the app upgrade path is ever missed, and so an admin can grant a plan by
-- simply inserting a paid ledger row.
--
-- Idempotent: re-applying the migration is a safe no-op (CREATE OR REPLACE /
-- DROP TRIGGER IF EXISTS). The trigger itself only fires on the transition INTO
-- the 'paid' state, so unrelated updates (e.g. updated_at bumps) never reset a
-- user's usage counters.

-- ---------------------------------------------------------------------------
-- Tier -> default monthly scan quota. Mirrors src/lib/tiers.ts (single source
-- of truth on the app side). Keep these two in sync.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION tier_default_quota(p_tier TEXT)
RETURNS INT AS $$
    SELECT CASE p_tier
        WHEN 'free'         THEN 5
        WHEN 'starter'      THEN 50
        WHEN 'business_pro' THEN 500
        WHEN 'agency_core'  THEN 5000
        ELSE 5
    END;
$$ LANGUAGE sql IMMUTABLE;

-- ---------------------------------------------------------------------------
-- On a payment becoming 'paid', upgrade the owning user_profiles row: set the
-- purchased tier + its default quota, mark the subscription active, reset the
-- period usage and stamp the granted billing window.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION apply_paid_upgrade_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Only act on the transition INTO 'paid'. If an already-paid row is updated
    -- again, do nothing (so usage counters are never reset out from under a
    -- customer mid-period).
    IF TG_OP = 'UPDATE' AND OLD.status = 'paid' THEN
        RETURN NEW;
    END IF;

    UPDATE user_profiles
    SET subscription_tier      = NEW.tier,
        monthly_scan_quota     = tier_default_quota(NEW.tier),
        subscription_status    = 'active',
        scans_used_this_period = 0,
        period_started_at      = COALESCE(NEW.period_start, NOW()),
        current_period_end     = COALESCE(NEW.period_end, NOW() + INTERVAL '1 month'),
        updated_at             = NOW()
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fire only when a row enters the 'paid' state (INSERT as paid, or an UPDATE
-- that flips status -> 'paid'). Avoids re-running on every later touch of the
-- ledger row, which would otherwise wipe scans_used_this_period back to 0.
DROP TRIGGER IF EXISTS payments_apply_paid_upgrade ON payments;
CREATE TRIGGER payments_apply_paid_upgrade
    AFTER INSERT OR UPDATE OF status ON payments
    FOR EACH ROW
    WHEN (NEW.status = 'paid')
    EXECUTE FUNCTION apply_paid_upgrade_on_payment();
