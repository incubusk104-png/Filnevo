-- Phase 3 (billing) — Agency overage metering.
--
-- Revised pricing introduces "growth protection": Agency tiers are allowed to
-- run scans BEYOND their included monthly quota instead of being hard-blocked.
-- Overage is metered at a fixed peso rate per scan and capped per period, so a
-- customer is never silently stopped mid-month but also can't run up an
-- unbounded bill.
--
--   rate : ₱0.50 per scan beyond the included quota
--   cap  : ₱2,000 of overage per billing period  (=> 4,000 overage scans)
--
-- Tiers that are NOT overage-eligible keep the existing hard block (deny once
-- the included quota is exhausted). The function's RETURN shape is unchanged,
-- so every caller of check_and_increment_quota keeps working untouched; the
-- overage itself is recorded on user_profiles for billing/reporting.
--
-- All statements are idempotent (ADD COLUMN IF NOT EXISTS / CREATE OR REPLACE).

-- ---------------------------------------------------------------------------
-- 1. Per-period overage counters on the profile (source of truth for billing).
-- ---------------------------------------------------------------------------
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS overage_scans_this_period INT NOT NULL DEFAULT 0;
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS overage_amount_this_period NUMERIC(14, 2) NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------------------
-- 2. Overage policy constants + eligibility. IMMUTABLE so the planner can fold
--    them and so they read as a single source of truth (mirror any change here
--    in the pricing UI / src/lib/tiers.ts).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION overage_rate_php()
RETURNS NUMERIC AS $$
    SELECT 0.50::NUMERIC;
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION overage_cap_php()
RETURNS NUMERIC AS $$
    SELECT 2000::NUMERIC;
$$ LANGUAGE sql IMMUTABLE;

-- Only Agency tiers get metered overage. ('agency_core_team' is listed ahead of
-- the multi-seat schema work so this never needs revisiting.)
CREATE OR REPLACE FUNCTION tier_allows_overage(p_tier TEXT)
RETURNS BOOLEAN AS $$
    SELECT p_tier IN ('agency_core', 'agency_core_team');
$$ LANGUAGE sql IMMUTABLE;

-- ---------------------------------------------------------------------------
-- 3. Quota check + increment, now overage-aware. Same signature and RETURN
--    columns as before, so the wrapper and /api/process-document are unaffected.
--    'FOR UPDATE' still serialises concurrent uploads from the same user.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_and_increment_quota(
    p_user_id UUID,
    p_workspace_id UUID,
    p_requested_batch_size INT
)
RETURNS TABLE (
    allowed BOOLEAN,
    quota_used INT,
    quota_limit INT,
    remaining INT,
    assigned_provider TEXT,
    assigned_model TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_tier TEXT;
    v_status TEXT;
    v_quota INT;
    v_used INT;
    v_overage_used INT;
    v_batch INT := GREATEST(1, COALESCE(p_requested_batch_size, 1));
    v_within INT;       -- scans of this batch that still fit inside the quota
    v_over INT;         -- scans of this batch that spill into overage
    v_cap_scans INT;    -- max overage scans allowed this period (cap / rate)
BEGIN
    -- 'FOR UPDATE' locks the row, blocking concurrent-request race conditions
    -- where a user fires many parallel uploads to bypass their monthly limit.
    SELECT subscription_tier, subscription_status, monthly_scan_quota,
           scans_used_this_period, overage_scans_this_period
    INTO v_tier, v_status, v_quota, v_used, v_overage_used
    FROM user_profiles
    WHERE id = p_user_id
    FOR UPDATE;

    -- Deny immediately if the profile is missing or not active.
    IF NOT FOUND OR v_status != 'active' THEN
        RETURN QUERY SELECT FALSE, COALESCE(v_used, 0), COALESCE(v_quota, 0), 0,
            'none'::TEXT, 'none'::TEXT;
        RETURN;
    END IF;

    -- Tenant isolation: if a workspace is supplied, the caller must be an
    -- accepted member.
    IF p_workspace_id IS NOT NULL THEN
        PERFORM 1 FROM workspace_members
        WHERE workspace_id = p_workspace_id
          AND user_id = p_user_id
          AND accepted_at IS NOT NULL;

        IF NOT FOUND THEN
            RETURN QUERY SELECT FALSE, v_used, v_quota,
                GREATEST(0, v_quota - v_used), 'none'::TEXT, 'none'::TEXT;
            RETURN;
        END IF;
    END IF;

    -- ----------------------------------------------------------------------
    -- Over-quota path: either hard-block (non-overage tiers) or meter the
    -- spill-over as paid overage (Agency tiers, up to the peso cap).
    -- ----------------------------------------------------------------------
    IF (v_used + v_batch) > v_quota THEN
        IF NOT tier_allows_overage(v_tier) THEN
            -- Unchanged behaviour: stop at the included quota.
            RETURN QUERY SELECT FALSE, v_used, v_quota,
                GREATEST(0, v_quota - v_used), 'none'::TEXT, 'none'::TEXT;
            RETURN;
        END IF;

        v_within := GREATEST(0, v_quota - v_used);   -- top up remaining quota first
        v_over := v_batch - v_within;                -- the rest is overage
        v_cap_scans := FLOOR(overage_cap_php() / overage_rate_php())::INT;

        -- Past the period overage cap (₱2,000): hard stop.
        IF (v_overage_used + v_over) > v_cap_scans THEN
            RETURN QUERY SELECT FALSE, v_used, v_quota, 0,
                'none'::TEXT, 'none'::TEXT;
            RETURN;
        END IF;

        -- Commit: fill any remaining quota, then record the metered overage.
        UPDATE user_profiles
        SET scans_used_this_period      = scans_used_this_period + v_within,
            overage_scans_this_period   = overage_scans_this_period + v_over,
            overage_amount_this_period  = overage_amount_this_period
                                          + (v_over * overage_rate_php()),
            total_lifetime_scans        = total_lifetime_scans + v_batch,
            updated_at                  = NOW()
        WHERE id = p_user_id;

        v_used := v_used + v_within;   -- now equals v_quota (quota fully used)

        -- Agency is a paid tier -> cheap OpenAI model.
        RETURN QUERY SELECT TRUE, v_used, v_quota, 0,
            'openai'::TEXT, 'gpt-4o-mini'::TEXT;
        RETURN;
    END IF;

    -- ----------------------------------------------------------------------
    -- Within-quota path (unchanged): commit usage before any model is invoked.
    -- ----------------------------------------------------------------------
    UPDATE user_profiles
    SET scans_used_this_period = scans_used_this_period + v_batch,
        total_lifetime_scans = total_lifetime_scans + v_batch,
        updated_at = NOW()
    WHERE id = p_user_id;

    v_used := v_used + v_batch;

    -- Provider routing: free -> Cerebras (zero cost), every paid tier -> cheap
    -- OpenAI.
    IF v_tier = 'free' THEN
        RETURN QUERY SELECT TRUE, v_used, v_quota, (v_quota - v_used),
            'cerebras'::TEXT, 'gpt-oss-120b'::TEXT;
    ELSE
        RETURN QUERY SELECT TRUE, v_used, v_quota, (v_quota - v_used),
            'openai'::TEXT, 'gpt-4o-mini'::TEXT;
    END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Reset overage alongside scans on the monthly rollover. (CREATE OR REPLACE
--    of the existing reset so a fresh period starts overage-free.)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    affected INT;
BEGIN
    UPDATE user_profiles
    SET scans_used_this_period = 0,
        overage_scans_this_period = 0,
        overage_amount_this_period = 0,
        period_started_at = NOW(),
        updated_at = NOW()
    WHERE period_started_at < NOW() - INTERVAL '1 month';
    GET DIAGNOSTICS affected = ROW_COUNT;
    RETURN affected;
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. A fresh paid period (payment becomes 'paid') also clears overage, so a
--    renewing/upgrading customer starts the new window with a clean slate.
--    Mirrors the app-side applyPaidUpgrade(); search_path pinned for hardening.
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

    -- Only act on the transition INTO 'paid'. If an already-paid row is updated
    -- again, do nothing (so usage counters are never reset out from under a
    -- customer mid-period).
    IF TG_OP = 'UPDATE' AND OLD.status = 'paid' THEN
        RETURN NEW;
    END IF;

    UPDATE user_profiles
    SET subscription_tier          = NEW.tier,
        monthly_scan_quota         = tier_default_quota(NEW.tier),
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
