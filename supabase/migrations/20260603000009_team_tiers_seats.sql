-- Phase 3 (billing) — Multi-seat "Agency Core Team" tier + seat schema.
--
-- Introduces a new paid tier, `agency_core_team`, that extends Agency Core with
-- TEAM SEATS: the owner buys a number of seats and each seat is one accepted
-- member across the owner's workspaces. The overage metering shipped in
-- 20260603000008 already lists `agency_core_team` as overage-eligible, so this
-- migration is the schema half that makes the tier real.
--
-- Seats are enforced at the DATABASE (defence in depth, mirroring the paid-
-- upgrade trigger): a BEFORE INSERT trigger on workspace_members rejects an
-- insert once the workspace owner has filled their seat allowance. The
-- allowance is GREATEST(tier base seats, seats purchased on the profile), so a
-- team can grow simply by raising user_profiles.seats (set by the billing
-- upgrade when a multi-seat plan is purchased).
--
-- Seat model (one row per accepted/pending membership = one seat):
--   free / starter           -> 1   (solo)
--   business_pro             -> 3
--   agency_core              -> 5
--   agency_core_team         -> GREATEST(5, purchased seats)   (expandable)
--
-- All statements are idempotent (DROP ... IF EXISTS / ADD COLUMN IF NOT EXISTS /
-- CREATE OR REPLACE), so re-applying on an already-provisioned database is a
-- safe no-op. Timestamped AFTER 20260603000008 so the overage-aware functions
-- already exist when this runs.

-- ---------------------------------------------------------------------------
-- 1. Allow the new tier in the tier CHECK constraints. The base constraints are
--    inline (auto-named <table>_<column>_check); drop + re-add idempotently.
-- ---------------------------------------------------------------------------
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_subscription_tier_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_tier_check
    CHECK (subscription_tier IN ('free', 'starter', 'business_pro', 'agency_core', 'agency_core_team'));

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_tier_check;
ALTER TABLE payments ADD CONSTRAINT payments_tier_check
    CHECK (tier IN ('free', 'starter', 'business_pro', 'agency_core', 'agency_core_team'));

-- ---------------------------------------------------------------------------
-- 2. Purchased seats. On the profile this is the number of seats the owner is
--    entitled to; on the payments ledger it is the seat count bought in that
--    checkout (carried into the profile by the paid-upgrade trigger below).
--    Defaults to 1 so every existing row / single-seat checkout is unchanged.
-- ---------------------------------------------------------------------------
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS seats INT NOT NULL DEFAULT 1;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_seats_check;
ALTER TABLE user_profiles
    ADD CONSTRAINT user_profiles_seats_check CHECK (seats >= 1);

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS seats INT NOT NULL DEFAULT 1;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_seats_check;
ALTER TABLE payments
    ADD CONSTRAINT payments_seats_check CHECK (seats >= 1);

-- ---------------------------------------------------------------------------
-- 3. Tier -> default monthly scan quota. CREATE OR REPLACE of the function from
--    20260603000007, now including agency_core_team. Mirrors src/lib/tiers.ts.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION tier_default_quota(p_tier TEXT)
RETURNS INT AS $$
    SELECT CASE p_tier
        WHEN 'free'             THEN 5
        WHEN 'starter'          THEN 50
        WHEN 'business_pro'     THEN 500
        WHEN 'agency_core'      THEN 5000
        WHEN 'agency_core_team' THEN 10000
        ELSE 5
    END;
$$ LANGUAGE sql IMMUTABLE;

-- ---------------------------------------------------------------------------
-- 4. Seat policy. Base seats included with a tier, and the effective limit once
--    purchased seats are taken into account. IMMUTABLE so they fold into plans
--    and read as a single source of truth (mirror in src/lib/tiers.ts).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION tier_base_seats(p_tier TEXT)
RETURNS INT AS $$
    SELECT CASE p_tier
        WHEN 'free'             THEN 1
        WHEN 'starter'          THEN 1
        WHEN 'business_pro'     THEN 3
        WHEN 'agency_core'      THEN 5
        WHEN 'agency_core_team' THEN 5
        ELSE 1
    END;
$$ LANGUAGE sql IMMUTABLE;

-- Effective seat limit = the larger of the tier's included seats and the seats
-- actually purchased. Only the team tier can expand beyond its base via
-- purchased seats; other tiers are pinned to their included allowance so a
-- stray `seats` value can never silently lift their limit.
CREATE OR REPLACE FUNCTION tier_seat_limit(p_tier TEXT, p_seats INT)
RETURNS INT AS $$
    SELECT CASE
        WHEN p_tier = 'agency_core_team'
            THEN GREATEST(tier_base_seats(p_tier), COALESCE(p_seats, 1))
        ELSE tier_base_seats(p_tier)
    END;
$$ LANGUAGE sql IMMUTABLE;

-- ---------------------------------------------------------------------------
-- 5. Seat enforcement. BEFORE INSERT on workspace_members: count the seats
--    already taken in the target workspace and reject the insert once the
--    owner's allowance is full. SECURITY DEFINER so the count sees every member
--    row regardless of the caller's RLS view. search_path pinned for hardening.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_workspace_seat_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_owner_id UUID;
    v_tier     TEXT;
    v_seats    INT;
    v_limit    INT;
    v_taken    INT;
BEGIN
    -- Resolve the workspace owner and their plan. A member of a workspace with
    -- no resolvable owner (orphaned) is left alone — nothing to meter against.
    SELECT w.owner_id INTO v_owner_id
    FROM workspaces w
    WHERE w.id = NEW.workspace_id;

    IF v_owner_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT subscription_tier, seats
    INTO v_tier, v_seats
    FROM user_profiles
    WHERE id = v_owner_id;

    v_limit := tier_seat_limit(COALESCE(v_tier, 'free'), COALESCE(v_seats, 1));

    -- Count seats currently held in this workspace (each membership row = a
    -- seat, including the owner's own membership and pending invites).
    SELECT COUNT(*) INTO v_taken
    FROM workspace_members
    WHERE workspace_id = NEW.workspace_id;

    IF v_taken >= v_limit THEN
        RAISE EXCEPTION
            'seat_limit_reached: workspace % is at its % seat limit (tier %)',
            NEW.workspace_id, v_limit, COALESCE(v_tier, 'free')
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workspace_members_enforce_seats ON workspace_members;
CREATE TRIGGER workspace_members_enforce_seats
    BEFORE INSERT ON workspace_members
    FOR EACH ROW
    EXECUTE FUNCTION enforce_workspace_seat_limit();

-- ---------------------------------------------------------------------------
-- 6. Carry purchased seats into the profile on a paid upgrade. CREATE OR REPLACE
--    of the 20260603000008 version (overage-resetting) with the seat write
--    added. Behaviour is otherwise identical: only fires on the transition INTO
--    'paid', resets usage + overage, stamps the granted billing window.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION apply_paid_upgrade_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.status = 'paid' THEN
        RETURN NEW;
    END IF;

    UPDATE user_profiles
    SET subscription_tier          = NEW.tier,
        monthly_scan_quota         = tier_default_quota(NEW.tier),
        seats                      = GREATEST(1, COALESCE(NEW.seats, 1)),
        subscription_status        = 'active',
        scans_used_this_period     = 0,
        overage_scans_this_period  = 0,
        overage_amount_this_period = 0,
        period_started_at          = COALESCE(NEW.period_start, NOW()),
        current_period_end         = COALESCE(NEW.period_end, NOW() + INTERVAL '1 month'),
        updated_at                 = NOW()
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$;
