-- ============================================================================
-- AXION Marketplace — Milestone 2: Product Preview URL
-- ============================================================================
-- Adds a preview_url column to the products table so admins can attach a
-- live preview/demo URL to products. The storefront product detail page
-- renders a "Live Preview" link when this field is populated.
--
-- Safe, idempotent, non-destructive.

alter table public.products
  add column if not exists preview_url text;
