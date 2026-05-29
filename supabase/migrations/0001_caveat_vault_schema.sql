-- ============================================================================
-- CAVEAT TRIPLE-LOCK VAULT SYSTEM
-- Phase 1: Infrastructure (SQL Schema, Quota Function, Row Level Security)
-- ----------------------------------------------------------------------------
-- Lock 2: check_and_increment_quota() - atomic PL/pgSQL with FOR UPDATE locks
-- Lock 3: Row Level Security on user_profiles, ai_processing_ledger, expenses
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUM TYPES
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'ledger_status') then
    create type ledger_status as enum ('verified', 'pending', 'failed');
  end if;
  if not exists (select 1 from pg_type where typname = 'tenant_plan') then
    create type tenant_plan as enum ('free', 'pro', 'enterprise');
  end if;
end$$;

-- ----------------------------------------------------------------------------
-- TABLE: user_profiles  (one row per authenticated tenant)
-- ----------------------------------------------------------------------------
create table if not exists public.user_profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  tenant_id          uuid not null default gen_random_uuid(),
  display_name       text,
  plan               tenant_plan not null default 'free',
  quota_limit        integer not null default 100 check (quota_limit >= 0),
  quota_used         integer not null default 0 check (quota_used >= 0),
  quota_period_start timestamptz not null default date_trunc('month', now()),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABLE: ai_processing_ledger  (immutable transactional ledger)
-- ----------------------------------------------------------------------------
create table if not exists public.ai_processing_ledger (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.user_profiles (id) on delete cascade,
  document_name text not null,
  status        ledger_status not null default 'pending',
  latency_ms    integer not null default 0 check (latency_ms >= 0),
  tokens        integer not null default 0 check (tokens >= 0),
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABLE: expenses
-- ----------------------------------------------------------------------------
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.user_profiles (id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  currency    text not null default 'USD',
  category    text not null default 'processing',
  description text,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- INDEXES
-- Verification: auth.uid() lookups hit a btree index for sub-millisecond execution.
-- ----------------------------------------------------------------------------
-- user_profiles.id IS the auth.uid() join column and already a PK (unique btree).
create index if not exists idx_ledger_user_id        on public.ai_processing_ledger (user_id);
create index if not exists idx_ledger_user_created    on public.ai_processing_ledger (user_id, created_at desc);
create index if not exists idx_expenses_user_id       on public.expenses (user_id);
create index if not exists idx_user_profiles_tenant   on public.user_profiles (tenant_id);

-- ============================================================================
-- LOCK 2: check_and_increment_quota
-- Atomically reserves quota for a tenant under a row-level FOR UPDATE lock so
-- concurrent /api/process-document calls cannot oversubscribe the quota.
-- ============================================================================
create or replace function public.check_and_increment_quota(
  p_user_id   uuid,
  p_increment integer default 1
)
returns table (
  allowed     boolean,
  quota_used  integer,
  quota_limit integer,
  remaining   integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used  integer;
  v_limit integer;
  v_start timestamptz;
begin
  if p_increment < 1 then
    raise exception 'increment must be >= 1, got %', p_increment;
  end if;

  -- Acquire an exclusive row lock for this tenant. Concurrent callers block here.
  select up.quota_used, up.quota_limit, up.quota_period_start
    into v_used, v_limit, v_start
    from public.user_profiles up
   where up.id = p_user_id
   for update;

  if not found then
    raise exception 'no user_profile for %', p_user_id using errcode = 'no_data_found';
  end if;

  -- Roll the quota window over at the start of each calendar month.
  if v_start < date_trunc('month', now()) then
    v_used  := 0;
    v_start := date_trunc('month', now());
    update public.user_profiles
       set quota_used = 0,
           quota_period_start = v_start,
           updated_at = now()
     where id = p_user_id;
  end if;

  if v_used + p_increment > v_limit then
    -- Quota would be exceeded: deny without incrementing (Ruby alarm upstream).
    return query select false, v_used, v_limit, greatest(v_limit - v_used, 0);
    return;
  end if;

  update public.user_profiles
     set quota_used = v_used + p_increment,
         updated_at = now()
   where id = p_user_id;

  return query
    select true, v_used + p_increment, v_limit, v_limit - (v_used + p_increment);
end;
$$;

-- ============================================================================
-- LOCK 3: ROW LEVEL SECURITY (tenant isolation)
-- ============================================================================
alter table public.user_profiles        enable row level security;
alter table public.ai_processing_ledger enable row level security;
alter table public.expenses             enable row level security;

-- Force RLS even for the table owner to guarantee isolation.
alter table public.user_profiles        force row level security;
alter table public.ai_processing_ledger force row level security;
alter table public.expenses             force row level security;

-- user_profiles: a tenant sees and edits only its own profile row.
drop policy if exists user_profiles_select on public.user_profiles;
create policy user_profiles_select on public.user_profiles
  for select using (auth.uid() = id);

drop policy if exists user_profiles_update on public.user_profiles;
create policy user_profiles_update on public.user_profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists user_profiles_insert on public.user_profiles;
create policy user_profiles_insert on public.user_profiles
  for insert with check (auth.uid() = id);

-- ai_processing_ledger: scoped to the owning tenant.
drop policy if exists ledger_select on public.ai_processing_ledger;
create policy ledger_select on public.ai_processing_ledger
  for select using (auth.uid() = user_id);

drop policy if exists ledger_insert on public.ai_processing_ledger;
create policy ledger_insert on public.ai_processing_ledger
  for insert with check (auth.uid() = user_id);

-- expenses: scoped to the owning tenant.
drop policy if exists expenses_select on public.expenses;
create policy expenses_select on public.expenses
  for select using (auth.uid() = user_id);

drop policy if exists expenses_insert on public.expenses;
create policy expenses_insert on public.expenses
  for insert with check (auth.uid() = user_id);

drop policy if exists expenses_update on public.expenses;
create policy expenses_update on public.expenses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Allow authenticated tenants to execute the quota function (runs SECURITY DEFINER).
grant execute on function public.check_and_increment_quota(uuid, integer) to authenticated;
