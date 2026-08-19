-- ============================================================================
-- AXION Marketplace — Owner-Controlled Initial Admin Setup
-- ============================================================================
-- PURPOSE:
--   Safely grant the 'admin' role to ONE existing authenticated user.
--
-- HOW TO USE:
--   1. Make sure the user has already signed up through the application
--      (they must exist in auth.users).
--   2. Replace the placeholder email below with the real email address.
--   3. Run this in the Supabase SQL Editor (Dashboard → SQL Editor).
--   4. Delete this script's contents afterwards, or keep it out of git.
--
-- SECURITY NOTES:
--   * This does NOT create a user, a password, or a secret admin account.
--   * This does NOT auto-promote the first user or any new signup.
--   * Normal signups only ever get the 'customer' role (see migration
--     0001_initial_schema.sql → handle_new_user() trigger).
--   * You can run this multiple times safely (it's idempotent).
-- ============================================================================

-- 👇 CHANGE THIS to the real email address of the admin:
-- (e.g.  'owner@example.com')
with target_user as (
  select id
  from auth.users
  where lower(email) = lower('YOUR_EMAIL_HERE')
  limit 1
),
admin_role as (
  select id
  from public.roles
  where name = 'admin'
),
inserted as (
  insert into public.user_roles (user_id, role_id)
  select target_user.id, admin_role.id
  from target_user, admin_role
  on conflict (user_id, role_id) do nothing
  returning user_id
)
select
  case
    when exists (select 1 from target_user) then
      'SUCCESS: admin role granted.'
    else
      'ERROR: No auth.users row matches that email. Have they signed up yet?'
  end as result;

-- Optionally record this in the audit log (uses the current SQL Editor user
-- as the actor, which will be null for direct SQL — that's fine, the action
-- is still recorded):
insert into public.audit_logs (actor_user_id, action, target_type, target_id, metadata)
select
  null,
  'role_changed',
  'user_roles',
  t.id::text,
  jsonb_build_object('role', 'admin', 'email', lower('YOUR_EMAIL_HERE'))
from auth.users t
where lower(t.email) = lower('YOUR_EMAIL_HERE')
  and exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = t.id and r.name = 'admin'
  );