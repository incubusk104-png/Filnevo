-- ============================================================================
-- CAVEAT VAULT — AGENCY-CORE EXPANSION
-- Phase A1: Workspaces, workspace-aware RLS, tiered quota.
-- Additive over 0001_caveat_vault_schema.sql (no destructive changes).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ENUM TYPES
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'workspace_role') then
    create type workspace_role as enum ('owner', 'admin', 'member');
  end if;
  if not exists (select 1 from pg_type where typname = 'approval_status') then
    create type approval_status as enum ('pending', 'approved', 'rejected');
  end if;
end$$;

-- ----------------------------------------------------------------------------
-- TIERED QUOTA: map a subscription plan to its monthly scan quota.
-- ----------------------------------------------------------------------------
create or replace function public.tier_quota(p_plan tenant_plan)
returns integer
language sql
immutable
as $$
  select case p_plan
    when 'free'       then 5
    when 'pro'        then 100
    when 'enterprise' then 1000
  end;
$$;

-- Keep quota_limit in sync with the plan whenever the plan changes.
create or replace function public.sync_tier_quota()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' or new.plan is distinct from old.plan then
    new.quota_limit := public.tier_quota(new.plan);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_tier_quota on public.user_profiles;
create trigger trg_sync_tier_quota
  before insert or update of plan on public.user_profiles
  for each row execute function public.sync_tier_quota();

-- ----------------------------------------------------------------------------
-- TABLE: workspaces (Agency-Core multi-tenant routing)
-- ----------------------------------------------------------------------------
create table if not exists public.workspaces (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner_id   uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABLE: workspace_members (role-based membership)
-- ----------------------------------------------------------------------------
create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  role         workspace_role not null default 'member',
  created_at   timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- ----------------------------------------------------------------------------
-- LEDGER: make it workspace-aware + add the approval queue status (Feat. 11)
-- ----------------------------------------------------------------------------
alter table public.ai_processing_ledger
  add column if not exists workspace_id    uuid references public.workspaces (id) on delete set null;
alter table public.ai_processing_ledger
  add column if not exists approval_status approval_status not null default 'pending';

-- ----------------------------------------------------------------------------
-- INDEXES (auth.uid() / workspace lookups hit btree indexes)
-- ----------------------------------------------------------------------------
create index if not exists idx_workspaces_owner          on public.workspaces (owner_id);
create index if not exists idx_ws_members_user           on public.workspace_members (user_id);
create index if not exists idx_ws_members_workspace      on public.workspace_members (workspace_id);
create index if not exists idx_ledger_workspace          on public.ai_processing_ledger (workspace_id);
create index if not exists idx_ledger_approval           on public.ai_processing_ledger (approval_status);

-- ----------------------------------------------------------------------------
-- MEMBERSHIP HELPERS (SECURITY DEFINER to avoid recursive RLS evaluation)
-- ----------------------------------------------------------------------------
create or replace function public.is_workspace_member(p_workspace uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.workspace_members m
     where m.workspace_id = p_workspace and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_owner(p_workspace uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.workspaces w
     where w.id = p_workspace and w.owner_id = auth.uid()
  );
$$;

-- ============================================================================
-- LOCK 3 (extended): workspace-aware Row Level Security
-- ============================================================================
alter table public.workspaces        enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspaces        force  row level security;
alter table public.workspace_members force  row level security;

-- workspaces: visible to owners and members; only the owner row can be created by self.
drop policy if exists workspaces_select on public.workspaces;
create policy workspaces_select on public.workspaces
  for select using (owner_id = auth.uid() or public.is_workspace_member(id));

drop policy if exists workspaces_insert on public.workspaces;
create policy workspaces_insert on public.workspaces
  for insert with check (owner_id = auth.uid());

drop policy if exists workspaces_update on public.workspaces;
create policy workspaces_update on public.workspaces
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- workspace_members: you see your own memberships; owners manage their workspace roster.
drop policy if exists ws_members_select on public.workspace_members;
create policy ws_members_select on public.workspace_members
  for select using (user_id = auth.uid() or public.is_workspace_owner(workspace_id));

drop policy if exists ws_members_insert on public.workspace_members;
create policy ws_members_insert on public.workspace_members
  for insert with check (public.is_workspace_owner(workspace_id));

drop policy if exists ws_members_delete on public.workspace_members;
create policy ws_members_delete on public.workspace_members
  for delete using (public.is_workspace_owner(workspace_id));

-- ai_processing_ledger: own rows OR rows in a workspace you belong to.
drop policy if exists ledger_select on public.ai_processing_ledger;
create policy ledger_select on public.ai_processing_ledger
  for select using (
    auth.uid() = user_id
    or (workspace_id is not null and public.is_workspace_member(workspace_id))
  );

drop policy if exists ledger_insert on public.ai_processing_ledger;
create policy ledger_insert on public.ai_processing_ledger
  for insert with check (
    auth.uid() = user_id
    and (workspace_id is null or public.is_workspace_member(workspace_id))
  );

-- Approvals (Feat. 11): only a workspace owner can change a row's approval_status.
drop policy if exists ledger_update on public.ai_processing_ledger;
create policy ledger_update on public.ai_processing_ledger
  for update using (
    workspace_id is not null and public.is_workspace_owner(workspace_id)
  ) with check (
    workspace_id is not null and public.is_workspace_owner(workspace_id)
  );

-- ----------------------------------------------------------------------------
-- GRANTS
-- ----------------------------------------------------------------------------
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.is_workspace_owner(uuid) to authenticated;
grant execute on function public.tier_quota(tenant_plan)  to authenticated;
