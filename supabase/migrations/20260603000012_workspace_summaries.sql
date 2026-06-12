-- Workspace summaries for API responses.
--
-- `workspace_members` RLS intentionally lets non-owners see only their own
-- membership row. That protects member details, but it also means an embedded
-- client-side count cannot produce the real workspace size. This RPC exposes a
-- narrow summary seam: only workspaces the caller can access, only the caller's
-- role, and a total membership count.

CREATE OR REPLACE FUNCTION list_accessible_workspace_summaries()
RETURNS TABLE (
    id UUID,
    name TEXT,
    owner_id UUID,
    role TEXT,
    member_count INT,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    WITH caller AS (
        SELECT auth.uid() AS user_id
    )
    SELECT
        w.id,
        w.name::TEXT,
        w.owner_id,
        CASE
            WHEN w.owner_id = c.user_id THEN 'owner'
            ELSE COALESCE(
                (
                    SELECT wm_self.role::TEXT
                    FROM workspace_members wm_self
                    WHERE wm_self.workspace_id = w.id
                      AND wm_self.user_id = c.user_id
                    ORDER BY
                        CASE WHEN wm_self.accepted_at IS NOT NULL THEN 0 ELSE 1 END,
                        wm_self.invited_at DESC
                    LIMIT 1
                ),
                'member'
            )
        END AS role,
        (
            SELECT COUNT(*)::INT
            FROM workspace_members wm_count
            WHERE wm_count.workspace_id = w.id
        ) AS member_count,
        w.created_at
    FROM workspaces w, caller c
    WHERE c.user_id IS NOT NULL
      AND w.is_active = TRUE
      AND (
          w.owner_id = c.user_id
          OR EXISTS (
              SELECT 1
              FROM workspace_members wm_access
              WHERE wm_access.workspace_id = w.id
                AND wm_access.user_id = c.user_id
                AND wm_access.accepted_at IS NOT NULL
          )
      )
    ORDER BY w.created_at DESC;
$$;

REVOKE ALL ON FUNCTION list_accessible_workspace_summaries() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION list_accessible_workspace_summaries() TO authenticated;
