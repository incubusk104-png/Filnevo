-- Admin + auth lifecycle.
-- Forward-ordered (after 20260603000004) so it applies cleanly to an existing
-- project whose user_profiles table predates the columns added here. All
-- statements are idempotent.

-- 1. Ensure admin/tenant columns exist on already-provisioned databases.
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS period_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Keep tenant_id aligned with id (audit export joins on tenant_id).
UPDATE user_profiles SET tenant_id = id WHERE tenant_id IS NULL;

-- 2. Auto-provision a profile row whenever a new auth user signs up.
--    SECURITY DEFINER so the trigger can write through RLS; pinned search_path
--    prevents schema-resolution hijacking.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO user_profiles (id, tenant_id, email, display_name)
    VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Monthly quota reset. Run on a schedule (pg_cron) or from an external cron
--    hitting an admin route. Resets usage once a full billing period elapsed.
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
        period_started_at = NOW(),
        updated_at = NOW()
    WHERE period_started_at < NOW() - INTERVAL '1 month';
    GET DIAGNOSTICS affected = ROW_COUNT;
    RETURN affected;
END;
$$;

-- Optional: schedule with pg_cron if the extension is enabled on the project.
-- Wrapped so the migration still succeeds when pg_cron is unavailable.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule(
            'filnevo-monthly-quota-reset',
            '0 0 * * *',
            'SELECT reset_monthly_quotas();'
        );
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- pg_cron not installed / insufficient privileges: skip silently.
    NULL;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_platform_admin) WHERE is_platform_admin;
