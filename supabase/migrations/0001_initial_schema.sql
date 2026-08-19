-- ============================================================================
-- AXION Marketplace — Milestone 1: Database, Security & Authorization Foundation
-- ============================================================================
-- This migration creates the full schema the application expects:
--   roles, user_roles, profiles, categories, products, product_files,
--   orders, order_items, founder_emails, audit_logs
--
-- It enables RLS everywhere and creates secure policies + helper functions.
-- Safe to run against an empty database. No destructive DROP statements.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. ROLES TABLE
-- ---------------------------------------------------------------------------
create table if not exists public.roles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique check (name in ('customer', 'admin')),
  description text,
  created_at  timestamptz not null default now()
);

-- Seed the standard roles
insert into public.roles (name, description)
values
  ('customer', 'A normal customer with access to public shop and their own purchases.'),
  ('admin',    'A trusted administrator with access to the private admin console.')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- 2. USER_ROLES TABLE
-- ---------------------------------------------------------------------------
create table if not exists public.user_roles (
  user_id    uuid not null references auth.users (id) on delete cascade,
  role_id    uuid not null references public.roles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

-- ---------------------------------------------------------------------------
-- 3. PROFILES TABLE
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. CATEGORIES TABLE
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. PRODUCTS TABLE
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id                        uuid primary key default gen_random_uuid(),
  name                      text not null,
  slug                      text not null unique,
  description               text,
  short_summary             text,
  category_id               uuid references public.categories (id) on delete set null,
  price_cents               integer not null default 0 check (price_cents >= 0),
  image_url                 text,
  screenshots               jsonb not null default '[]'::jsonb,
  is_published              boolean not null default false,
  is_coming_soon            boolean not null default false,
  is_featured               boolean not null default false,
  version                   text not null default '1.0.0',
  changelog                 text,
  documentation_url         text,
  support_url               text,
  lemon_squeezy_variant_id  text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6. PRODUCT FILES TABLE
-- ---------------------------------------------------------------------------
create table if not exists public.product_files (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id) on delete cascade,
  file_name    text not null,
  storage_path text not null,
  file_size    bigint,
  version      text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 7. ORDERS TABLE
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null references auth.users (id) on delete cascade,
  status                      text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  total_cents                 integer not null default 0 check (total_cents >= 0),
  currency                    text not null default 'usd',
  payment_provider            text,
  payment_provider_order_id   text,
  customer_email              text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 8. ORDER ITEMS TABLE
-- ---------------------------------------------------------------------------
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  product_name  text not null,
  price_cents   integer not null check (price_cents >= 0),
  quantity      integer not null default 1 check (quantity > 0),
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 9. FOUNDER EMAILS (legacy/owner allowlist — kept for compatibility)
-- ---------------------------------------------------------------------------
create table if not exists public.founder_emails (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 10. AUDIT LOGS TABLE
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id            uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id) on delete set null,
  action        text not null,
  target_type   text,
  target_id     text,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY — ENABLE ON ALL APPLICATION TABLES
-- ============================================================================
alter table public.roles          enable row level security;
alter table public.user_roles     enable row level security;
alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_files  enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.founder_emails enable row level security;
alter table public.audit_logs     enable row level security;

-- ============================================================================
-- HELPER: is_admin(user_id) — SECURITY DEFINER with locked search_path
-- ============================================================================
-- This is the single source of truth for admin authorization. It runs as the
-- table owner (bypassing RLS) with a fixed search_path to prevent privilege
-- escalation via search_path hijacking. It only returns a boolean.
create or replace function public.is_admin(check_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = check_user_id
      and r.name = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- HELPER: current user is admin
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_admin(auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- HELPER: get the current user's role name(s)
-- ---------------------------------------------------------------------------
create or replace function public.user_role_names()
returns text[]
language sql
security definer
set search_path = public
as $$
  select coalesce(array_agg(r.name order by r.name), '{}'::text[])
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
  where ur.user_id = auth.uid();
$$;

-- ============================================================================
-- TRIGGER: auto-create profile + assign 'customer' role on signup
-- ============================================================================
-- A new user always gets the 'customer' role. NEVER admin. The only way to
-- become admin is for an existing admin/owner to run the owner-controlled
-- script (scripts/create-initial-admin.sql).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role_id)
  select new.id, r.id
  from public.roles r
  where r.name = 'customer'
  on conflict (user_id, role_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- TRIGGER: bump updated_at on mutable tables
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists set_product_files_updated_at on public.product_files;
create trigger set_product_files_updated_at
  before update on public.product_files
  for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PROFILES
--   - anyone can read a profile (needed if we show product owners)
--   - a user can update their own profile (but NOT role fields — none here)
--   - admins can update any profile
-- ---------------------------------------------------------------------------
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- ROLES
--   - anyone authenticated can read role names (needed to resolve names)
--   - only admins can insert/update/delete roles
-- ---------------------------------------------------------------------------
drop policy if exists "Roles are readable by authenticated users" on public.roles;
create policy "Roles are readable by authenticated users"
  on public.roles for select
  using (auth.role() = 'authenticated');

drop policy if exists "Only admins can manage roles" on public.roles;
create policy "Only admins can manage roles"
  on public.roles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- USER_ROLES
--   - a user can read their own role(s)
--   - admins can read all user roles
--   - ONLY admins can insert/update/delete user roles
--     (prevents self-assignment of admin / modifying others)
-- ---------------------------------------------------------------------------
drop policy if exists "Users can read their own roles" on public.user_roles;
create policy "Users can read their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can read all user roles" on public.user_roles;
create policy "Admins can read all user roles"
  on public.user_roles for select
  using (public.is_admin());

drop policy if exists "Only admins can manage user roles" on public.user_roles;
create policy "Only admins can manage user roles"
  on public.user_roles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- CATEGORIES
--   - anyone (public) can read published categories
--   - only admins can insert/update/delete
-- ---------------------------------------------------------------------------
drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
  on public.categories for select
  using (true);

drop policy if exists "Only admins can manage categories" on public.categories;
create policy "Only admins can manage categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- PRODUCTS
--   - anyone (public) can read published products
--   - admins can read all products (including drafts)
--   - only admins can insert/update/delete
-- ---------------------------------------------------------------------------
drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
  on public.products for select
  using (is_published = true);

drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products"
  on public.products for select
  using (public.is_admin());

drop policy if exists "Only admins can manage products" on public.products;
create policy "Only admins can manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- PRODUCT_FILES
--   - NOT publicly readable (paid files must stay private)
--   - admins can read/manage all files
--   - a purchased customer can read files for products they own
--     (implemented via orders/order_items join below)
-- ---------------------------------------------------------------------------
drop policy if exists "Admins can read product files" on public.product_files;
create policy "Admins can read product files"
  on public.product_files for select
  using (public.is_admin());

drop policy if exists "Only admins can manage product files" on public.product_files;
create policy "Only admins can manage product files"
  on public.product_files for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Purchasers can read their product files" on public.product_files;
create policy "Purchasers can read their product files"
  on public.product_files for select
  using (
    exists (
      select 1
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.user_id = auth.uid()
        and o.status = 'paid'
        and oi.product_id = product_files.product_id
    )
  );

-- ---------------------------------------------------------------------------
-- ORDERS
--   - a user can read their own orders
--   - admins can read/manage all orders
--   - customers can NEVER modify orders (especially not mark them paid)
-- ---------------------------------------------------------------------------
drop policy if exists "Users can read their own orders" on public.orders;
create policy "Users can read their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can read all orders" on public.orders;
create policy "Admins can read all orders"
  on public.orders for select
  using (public.is_admin());

drop policy if exists "Only admins can manage orders" on public.orders;
create policy "Only admins can manage orders"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- ORDER_ITEMS
--   - a user can read items of their own orders
--   - admins can read/manage all
-- ---------------------------------------------------------------------------
drop policy if exists "Users can read their own order items" on public.order_items;
create policy "Users can read their own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can read all order items" on public.order_items;
create policy "Admins can read all order items"
  on public.order_items for select
  using (public.is_admin());

drop policy if exists "Only admins can manage order items" on public.order_items;
create policy "Only admins can manage order items"
  on public.order_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- FOUNDER_EMAILS (legacy)
--   - NOT readable by normal users (no RLS read policy for public/authenticated)
--   - only admins can manage it
--   - This is now legacy; the primary authorization is user_roles -> roles.
-- ---------------------------------------------------------------------------
drop policy if exists "Only admins can manage founder emails" on public.founder_emails;
create policy "Only admins can manage founder emails"
  on public.founder_emails for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- AUDIT_LOGS
--   - only admins can read
--   - only admins can insert (server-side service-role / admin-context writes)
-- ---------------------------------------------------------------------------
drop policy if exists "Only admins can read audit logs" on public.audit_logs;
create policy "Only admins can read audit logs"
  on public.audit_logs for select
  using (public.is_admin());

drop policy if exists "Only admins can write audit logs" on public.audit_logs;
create policy "Only admins can write audit logs"
  on public.audit_logs for insert
  with check (public.is_admin());

-- ============================================================================
-- GRANTS (so the anon/authenticated roles can use the tables via the API)
-- ============================================================================
grant usage on schema public to anon, authenticated;
grant select on public.roles to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.user_roles to authenticated;
grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant select on public.product_files to authenticated;

-- ============================================================================
-- INDEXES
-- ============================================================================
create index if not exists idx_products_slug          on public.products (slug);
create index if not exists idx_products_category_id   on public.products (category_id);
create index if not exists idx_products_is_published  on public.products (is_published) where is_published = true;
create index if not exists idx_products_is_featured   on public.products (is_featured) where is_featured = true;
create index if not exists idx_products_created_at    on public.products (created_at desc);
create index if not exists idx_categories_slug        on public.categories (slug);
create index if not exists idx_orders_user_id         on public.orders (user_id);
create index if not exists idx_orders_status          on public.orders (status);
create index if not exists idx_orders_created_at      on public.orders (created_at desc);
create index if not exists idx_order_items_order_id   on public.order_items (order_id);
create index if not exists idx_order_items_product_id on public.order_items (product_id);
create index if not exists idx_product_files_product  on public.product_files (product_id);
create index if not exists idx_user_roles_user_id     on public.user_roles (user_id);
create index if not exists idx_user_roles_role_id     on public.user_roles (role_id);
create index if not exists idx_founder_emails_email   on public.founder_emails (email);
create index if not exists idx_audit_logs_actor       on public.audit_logs (actor_user_id);
create index if not exists idx_audit_logs_created_at  on public.audit_logs (created_at desc);