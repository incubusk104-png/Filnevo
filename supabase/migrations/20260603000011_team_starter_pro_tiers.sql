-- Phase 3 (billing) — Two fixed-seat TEAM tiers: `team_starter`, `team_pro`.
--
-- The landing pricing page now offers a self-serve Team plan set. `team_starter`
-- and `team_pro` are fixed-seat tiers (no per-seat expansion, unlike
-- `agency_core_team`): the included seats come entirely from tier_base_seats.
-- Mirrors src/lib/tiers.ts:
--
--   team_starter -> ₱799/mo,   150 scans/mo,   3 seats (fixed)
--   team_pro     -> ₱1,999/mo, 1,500 scans/mo, 5 seats (fixed)
--
-- All statements are idempotent (DROP ... IF EXISTS / CREATE OR REPLACE), so
-- re-applying on an already-provisioned database is a safe no-op. Timestamped
-- AFTER 20260603000010 so it layers on top of the existing tier functions.

-- ---------------------------------------------------------------------------
-- 1. Allow the new tiers in the tier CHECK constraints.
-- ---------------------------------------------------------------------------
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_subscription_tier_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_tier_check
    CHECK (subscription_tier IN ('free', 'starter', 'business_pro', 'agency_core', 'team_starter', 'team_pro', 'agency_core_team'));

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_tier_check;
ALTER TABLE payments ADD CONSTRAINT payments_tier_check
    CHECK (tier IN ('free', 'starter', 'business_pro', 'agency_core', 'team_starter', 'team_pro', 'agency_core_team'));

-- ---------------------------------------------------------------------------
-- 2. Tier -> default monthly scan quota. CREATE OR REPLACE of the function from
--    20260603000009, now including the two team tiers. Mirrors src/lib/tiers.ts.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION tier_default_quota(p_tier TEXT)
RETURNS INT AS $$
    SELECT CASE p_tier
        WHEN 'free'             THEN 5
        WHEN 'starter'          THEN 50
        WHEN 'business_pro'     THEN 500
        WHEN 'agency_core'      THEN 5000
        WHEN 'team_starter'     THEN 150
        WHEN 'team_pro'         THEN 1500
        WHEN 'agency_core_team' THEN 10000
        ELSE 5
    END;
$$ LANGUAGE sql IMMUTABLE;

-- ---------------------------------------------------------------------------
-- 3. Base seats included with a tier. CREATE OR REPLACE of the function from
--    20260603000009, now including the two team tiers. The team tiers are NOT
--    expandable, so tier_seat_limit's ELSE branch (= tier_base_seats) already
--    yields the correct fixed allowance — no change needed there.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION tier_base_seats(p_tier TEXT)
RETURNS INT AS $$
    SELECT CASE p_tier
        WHEN 'free'             THEN 1
        WHEN 'starter'          THEN 1
        WHEN 'business_pro'     THEN 3
        WHEN 'agency_core'      THEN 5
        WHEN 'team_starter'     THEN 3
        WHEN 'team_pro'         THEN 5
        WHEN 'agency_core_team' THEN 5
        ELSE 1
    END;
$$ LANGUAGE sql IMMUTABLE;
