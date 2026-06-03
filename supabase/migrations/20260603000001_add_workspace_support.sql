-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    owner_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create workspace_members table
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'media_buyer', 'external_cpa', 'viewer')),
    invited_by UUID REFERENCES user_profiles(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ NULL,
    UNIQUE(workspace_id, user_id)
);

-- Add workspace_id to ai_processing_ledger (nullable for backward compatibility)
ALTER TABLE ai_processing_ledger
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;

-- Add workspace_id to expenses (nullable for backward compatibility)
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_workspace ON ai_processing_ledger(workspace_id);
CREATE INDEX IF NOT EXISTS idx_expenses_workspace ON expenses(workspace_id);

-- Update the updated_at timestamp on workspaces when a row is updated
CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON workspaces
FOR EACH ROW
EXECUTE FUNCTION
    update_updated_at_column();