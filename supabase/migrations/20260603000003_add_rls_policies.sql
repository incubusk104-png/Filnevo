-- Enable Row Level Security on tables for tenant isolation (LOCK 3)
-- This implements LOCK 3: Automated Tenant Isolation (Supabase Row-Level Security)

-- Enable RLS on core tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can only see/update their own profile
CREATE POLICY user_profile_rls ON user_profiles
    FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

-- Workspaces: Users can see/workspaces they own or are members of
CREATE POLICY workspace_rls ON workspaces
    FOR ALL TO authenticated
    USING (
        owner_id = (SELECT auth.uid()) OR
        id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = (SELECT auth.uid()) AND accepted_at IS NOT NULL
        )
    )
    WITH CHECK (
        owner_id = (SELECT auth.uid()) OR
        id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = (SELECT auth.uid()) AND accepted_at IS NOT NULL
        )
    );

-- Workspace members: Users can see/manage members of workspaces they own or admin
CREATE POLICY workspace_members_rls ON workspace_members
    FOR ALL TO authenticated
    USING (
        workspace_id IN (
            SELECT id FROM workspaces
            WHERE owner_id = (SELECT auth.uid())
        )
        OR
        user_id = (SELECT auth.uid())  -- Users can see their own membership
    )
    WITH CHECK (
        workspace_id IN (
            SELECT id FROM workspaces
            WHERE owner_id = (SELECT auth.uid())
        )
    );

-- AI Processing Ledger: Users can see/enter data for their workspaces
CREATE POLICY ledger_rls ON ai_processing_ledger
    FOR ALL TO authenticated
    USING (
        user_id = (SELECT auth.uid()) OR
        workspace_id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = (SELECT auth.uid()) AND accepted_at IS NOT NULL
        )
    )
    WITH CHECK (
        user_id = (SELECT auth.uid()) OR
        workspace_id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = (SELECT auth.uid()) AND accepted_at IS NOT NULL
        )
    );

-- Expenses: Users can see/create expenses for their workspaces
CREATE POLICY expense_rls ON expenses
    FOR ALL TO authenticated
    USING (
        user_id = (SELECT auth.uid()) OR
        workspace_id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = (SELECT auth.uid()) AND accepted_at IS NOT NULL
        )
    )
    WITH CHECK (
        user_id = (SELECT auth.uid()) OR
        workspace_id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = (SELECT auth.uid()) AND accepted_at IS NOT NULL
        )
    );

-- Performance optimization indexes (matching the architecture document)
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_id ON user_profiles(id);  -- auth_id is the id column in user_profiles
CREATE INDEX IF NOT EXISTS idx_ledger_owner_map ON ai_processing_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_workspace_map ON ai_processing_ledger(workspace_id);
CREATE INDEX IF NOT EXISTS idx_expenses_owner_map ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_workspace_map ON expenses(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_lookup ON workspace_members(workspace_id, user_id);