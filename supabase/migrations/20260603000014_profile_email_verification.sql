-- App-level email verification marker.
--
-- Supabase Auth's `email_confirmed_at` depends on the Dashboard setting. Filnevo
-- additionally records when the user completed this app's verification path so
-- email/password accounts created while Confirm email was off cannot silently
-- bypass the code screen later.

ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Do not lock out existing customers when this marker is introduced. New
-- email/password accounts only receive this value after `verifyOtp(type:
-- 'signup')`; new OAuth accounts receive it in `/auth/callback`.
UPDATE user_profiles
SET email_verified_at = COALESCE(email_verified_at, updated_at, created_at, NOW())
WHERE email_verified_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_email_verified_at
    ON user_profiles(email_verified_at)
    WHERE email_verified_at IS NOT NULL;
