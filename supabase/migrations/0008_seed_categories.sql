-- ============================================================================
-- AXION Marketplace — Milestone: Seed Categories
-- ============================================================================
-- This migration inserts the initial category records so the shared
-- admin/customer category system has data to display.
--
-- It is idempotent: ON CONFLICT (slug) DO NOTHING prevents duplicate
-- inserts if the migration is re-run.
--
-- Safe to run against an existing database. No destructive operations.
-- ============================================================================

insert into public.categories (name, slug, description)
values
  ('Business', 'business', 'Practical systems, templates, and assets for business operations and execution.')
on conflict (slug) do nothing;
