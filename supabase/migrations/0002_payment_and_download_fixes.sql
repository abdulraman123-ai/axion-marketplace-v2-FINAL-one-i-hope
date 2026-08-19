-- ============================================================================
-- AXION Marketplace — Milestone: Payment & Download Correctness Fixes
-- ============================================================================
-- This migration reconciles the application code with the schema. The webhook
-- route references `lemon_squeezy_order_id` and writes `status = 'completed'`,
-- but the original schema provided only `payment_provider_order_id` and a
-- status check constraint that did not include 'completed'. This migration:
--
--   1. Adds a `lemon_squeezy_order_id` column (unique, for idempotency).
--   2. Expands the orders status check to include 'completed'.
--   3. Backfills the new column from existing payment_provider_order_id rows.
--   4. Adds a download_records table for tracking authorized downloads.
--   5. Adds RLS, policies, grants, and indexes for download_records.
--
-- Safe, idempotent, non-destructive. No DROP of existing tables/columns.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. ORDERS — add lemon_squeezy_order_id (used by the webhook) + idempotency
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists lemon_squeezy_order_id text;

-- Backfill from the existing provider order id column so existing rows are
-- not orphaned.
update public.orders
set lemon_squeezy_order_id = payment_provider_order_id
where lemon_squeezy_order_id is null
  and payment_provider_order_id is not null;

-- Unique partial index → duplicate webhook deliveries fail harmlessly and can
-- be detected with error code 23505.
create unique index if not exists idx_orders_lemon_squeezy_order_id
  on public.orders (lemon_squeezy_order_id)
  where lemon_squeezy_order_id is not null;

-- ---------------------------------------------------------------------------
-- 2. ORDERS — expand status check constraint to include 'completed'
-- ---------------------------------------------------------------------------
-- The application's webhook and dashboard both filter/insert with
-- status='completed'. The original constraint only allowed
-- ('pending','paid','failed','refunded','cancelled'). We expand it here so
-- existing application behavior is valid. 'paid' and 'completed' both mean
-- the order was settled; 'completed' is the historical value written by the
-- webhook.
alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending', 'paid', 'completed', 'failed', 'refunded', 'cancelled'));

-- ---------------------------------------------------------------------------
-- 3. DOWNLOAD RECORDS TABLE
-- ---------------------------------------------------------------------------
-- Tracks when a customer downloads a file they legitimately own. This gives
-- the admin Downloads module real data and gives the customer a record of
-- their access.
create table if not exists public.download_records (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  file_id       uuid references public.product_files (id) on delete set null,
  created_at    timestamptz not null default now()
);

alter table public.download_records enable row level security;

-- A user can see their own download records.
drop policy if exists "Users can read their own download records" on public.download_records;
create policy "Users can read their own download records"
  on public.download_records for select
  using (auth.uid() = user_id);

-- Admins can read and manage all download records.
drop policy if exists "Admins can manage download records" on public.download_records;
create policy "Admins can manage download records"
  on public.download_records for all
  using (public.is_admin())
  with check (public.is_admin());

-- The webhook/download route writes download records server-side using the
-- service-role key (bypasses RLS), so we only need SELECT grants for users;
-- INSERT via the anon/authenticated role is intentionally denied to prevent
-- customers from fabricating download history.
grant select on public.download_records to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. INDEXES
-- ---------------------------------------------------------------------------
create index if not exists idx_download_records_user_id
  on public.download_records (user_id);

create index if not exists idx_download_records_product_id
  on public.download_records (product_id);

create index if not exists idx_download_records_file_id
  on public.download_records (file_id);

create index if not exists idx_download_records_created_at
  on public.download_records (created_at desc);

-- ---------------------------------------------------------------------------
-- 5. ORDER ITEMS — add currency so the recorded price is always unambiguous.
--    (product_name is already NOT NULL in the base schema.)
-- ---------------------------------------------------------------------------
alter table public.order_items
  add column if not exists currency text not null default 'usd';
