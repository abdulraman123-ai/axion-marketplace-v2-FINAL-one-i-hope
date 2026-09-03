-- ============================================================================
-- AXION Marketplace — Milestone: Add Selar Product URL
-- ============================================================================
-- Adds a permanent `selar_url` column to the `products` table so each
-- product can store its own Selar checkout link.
--
-- This is additive and safe to run against an existing database:
--   - nullable with no default
--   - does not modify any existing column
--   - existing products continue to work without a Selar URL
--
-- Lemon Squeezy columns are intentionally left intact for now.
-- ============================================================================

alter table public.products
  add column if not exists selar_url text;
