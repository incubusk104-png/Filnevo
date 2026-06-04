-- LOCK 2 routing update: free tier -> Cerebras (free), paid tiers -> cheap OpenAI.
--
-- Why this migration exists:
--   1. The previous function routed free->Gemini and agency_core->DeepSeek, which
--      contradicts the product decision: free accounts run on Cerebras (zero cost),
--      paid accounts run on a cheap-but-accurate OpenAI model (gpt-4o-mini). Sending
--      free users to a paid provider, or agency users to a different vendor than the
--      one the margin math assumes, wastes quota/spend.
--   2. The old signature/return columns (target_* params, is_allowed/remaining_quota)
--      did not match what /api/process-document calls (p_* params) or reads
--      (allowed/quota_used/quota_limit/remaining), so live mode never worked.
--
-- Recommended models (high accuracy, no wasted quota):
--   free                                   -> cerebras / gpt-oss-120b   (free tier, structured outputs)
--   starter | business_pro | agency_core   -> openai   / gpt-4o-mini    (cheap, accurate)
--
-- Keep this in sync with src/lib/ai/providers.ts (single source of truth in app code).

-- Return column names/types changed, so the old definitions must be dropped first.
DROP FUNCTION IF EXISTS check_and_increment_quota(UUID, UUID, INT);
DROP FUNCTION IF EXISTS check_and_increment_quota(UUID, INT);
DROP FUNCTION IF EXISTS check_and_increment_quota_legacy(UUID, INT);

CREATE FUNCTION check_and_increment_quota(
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
) AS $$
DECLARE
    v_tier TEXT;
    v_status TEXT;
    v_quota INT;
    v_used INT;
    v_batch INT := GREATEST(1, COALESCE(p_requested_batch_size, 1));
BEGIN
    -- 'FOR UPDATE' locks the row, blocking concurrent-request race conditions
    -- where a user fires many parallel uploads to bypass their monthly limit.
    SELECT subscription_tier, subscription_status, monthly_scan_quota, scans_used_this_period
    INTO v_tier, v_status, v_quota, v_used
    FROM user_profiles
    WHERE id = p_user_id
    FOR UPDATE;

    -- Deny immediately if the profile is missing or not active.
    IF NOT FOUND OR v_status != 'active' THEN
        RETURN QUERY SELECT FALSE, COALESCE(v_used, 0), COALESCE(v_quota, 0), 0, 'none'::TEXT, 'none'::TEXT;
        RETURN;
    END IF;

    -- Tenant isolation: if a workspace is supplied, the caller must be an accepted member.
    IF p_workspace_id IS NOT NULL THEN
        PERFORM 1 FROM workspace_members
        WHERE workspace_id = p_workspace_id
          AND user_id = p_user_id
          AND accepted_at IS NOT NULL;

        IF NOT FOUND THEN
            RETURN QUERY SELECT FALSE, v_used, v_quota, GREATEST(0, v_quota - v_used), 'none'::TEXT, 'none'::TEXT;
            RETURN;
        END IF;
    END IF;

    -- Hard stop: block the batch if it would exceed the monthly balance.
    IF (v_used + v_batch) > v_quota THEN
        RETURN QUERY SELECT FALSE, v_used, v_quota, GREATEST(0, v_quota - v_used), 'none'::TEXT, 'none'::TEXT;
        RETURN;
    END IF;

    -- Commit usage to the ledger before any model is invoked.
    UPDATE user_profiles
    SET scans_used_this_period = scans_used_this_period + v_batch,
        total_lifetime_scans = total_lifetime_scans + v_batch,
        updated_at = NOW()
    WHERE id = p_user_id;

    v_used := v_used + v_batch;

    -- Provider routing: free -> Cerebras (zero cost), every paid tier -> cheap OpenAI.
    IF v_tier = 'free' THEN
        RETURN QUERY SELECT TRUE, v_used, v_quota, (v_quota - v_used), 'cerebras'::TEXT, 'gpt-oss-120b'::TEXT;
    ELSE
        RETURN QUERY SELECT TRUE, v_used, v_quota, (v_quota - v_used), 'openai'::TEXT, 'gpt-4o-mini'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backward-compatible wrapper for callers that don't pass a workspace id.
CREATE FUNCTION check_and_increment_quota(
    p_user_id UUID,
    p_requested_batch_size INT
)
RETURNS TABLE (
    allowed BOOLEAN,
    quota_used INT,
    quota_limit INT,
    remaining INT,
    assigned_provider TEXT,
    assigned_model TEXT
) AS $$
    SELECT * FROM check_and_increment_quota(p_user_id, NULL::UUID, p_requested_batch_size);
$$ LANGUAGE sql SECURITY DEFINER;
