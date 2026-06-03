-- Update the quota checking function to be workspace-aware and secure
-- This implements LOCK 2: The Profit Safeguard (Atomic PL/pgSQL Optimization)
CREATE OR REPLACE FUNCTION check_and_increment_quota(
    target_user_id UUID,
    target_workspace_id UUID,
    requested_batch_size INT
)
RETURNS TABLE (
    is_allowed BOOLEAN,
    remaining_quota INT,
    assigned_provider TEXT,
    assigned_model TEXT
) AS $$
DECLARE
    v_user_tier TEXT;
    v_user_status TEXT;
    v_user_quota INT;
    v_user_used INT;
    v_workspace_tier TEXT;
    v_workspace_status TEXT;
    v_workspace_quota INT;
    v_workspace_used INT;
    v_effective_quota INT;
    v_effective_used INT;
BEGIN
    -- First, check user profile with FOR UPDATE lock to prevent race conditions
    SELECT subscription_tier, subscription_status, monthly_scan_quota, scans_used_this_period
    INTO v_user_tier, v_user_status, v_user_quota, v_user_used
    FROM user_profiles
    WHERE id = target_user_id
    FOR UPDATE;

    -- Safeguard: If the account profile doesn't exist or is suspended, deny access immediately
    IF NOT FOUND OR v_user_status != 'active' THEN
        RETURN QUERY SELECT FALSE, 0, 'none'::TEXT, 'none'::TEXT;
        RETURN;
    END IF;

    -- If workspace_id is provided, check workspace limits too
    IF target_workspace_id IS NOT NULL THEN
        -- Get workspace settings to determine if it has custom quotas
        -- For now, we'll check if the workspace has explicit quota settings
        -- In a full implementation, you might have a separate workspace_quotas table

        -- Check if user is a member of this workspace and what their role is
        PERMITTED_ROLES: LOOP
            EXIT WHEN NOT FOUND;
            -- This is a simplified check - in reality you'd join workspace_members
            -- and check the user's role and the workspace's quota settings
            EXIT;
        END LOOP PERMITTED_ROLES;

        -- For Agency Core, we might have workspace-level quotas
        -- For simplicity in this implementation, we'll use user quotas
        -- but validate that the user has access to the workspace
        PERFORM 1 FROM workspace_members
        WHERE workspace_id = target_workspace_id
          AND user_id = target_user_id
          AND accepted_at IS NOT NULL;

        IF NOT FOUND THEN
            -- User is not an accepted member of this workspace
            RETURN QUERY SELECT FALSE, 0, 'none'::TEXT, 'none'::TEXT;
            RETURN;
        END IF;
    END IF;

    -- Hard Stop: Block request if the upload size exceeds their available monthly balance
    IF (v_user_used + requested_batch_size) > v_user_quota THEN
        RETURN QUERY SELECT FALSE, (v_user_quota - v_user_used), 'none'::TEXT, 'none'::TEXT;
        RETURN;
    END IF;

    -- Commit the usage to the ledger before routing to paid AI models
    UPDATE user_profiles
    SET scans_used_this_period = scans_used_this_period + requested_batch_size,
        total_lifetime_scans = total_lifetime_scans + requested_batch_size,
        updated_at = NOW()
    WHERE id = target_user_id;

    -- Optimization: Direct high-volume agency background extraction straight to DeepSeek
    IF v_user_tier = 'agency_core' THEN
        RETURN QUERY SELECT TRUE, (v_user_quota - (v_user_used + requested_batch_size)), 'deepseek_advanced'::TEXT, 'deepseek-v4-flash'::TEXT;
    ELSIF v_user_tier = 'free' THEN
        RETURN QUERY SELECT TRUE, (v_user_quota - (v_user_used + requested_batch_size)), 'gemini_free'::TEXT, 'gemini-1.5-flash'::TEXT;
    ELSE
        RETURN QUERY SELECT TRUE, (v_user_quota - (v_user_used + requested_batch_size)), 'openai_paid'::TEXT, 'gpt-4o-mini'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also create a version that doesn't require workspace_id for backward compatibility
CREATE OR REPLACE FUNCTION check_and_increment_quota_legacy(
    target_user_id UUID,
    requested_batch_size INT
)
RETURNS TABLE (
    is_allowed BOOLEAN,
    remaining_quota INT,
    assigned_provider TEXT,
    assigned_model TEXT
) AS $$
    SELECT * FROM check_and_increment_quota(target_user_id, NULL, requested_batch_size);
$$ LANGUAGE plpgsql SECURITY DEFINER;