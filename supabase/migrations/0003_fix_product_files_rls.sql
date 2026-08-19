-- ============================================================================
-- AXION Marketplace — Milestone 1 Fix: Product Files Download Authorization
-- ============================================================================
-- The webhook writes orders with status 'completed', and the dashboard /
-- purchases / downloads pages all filter on both 'paid' and 'completed'.
-- However, the product_files RLS policy "Purchasers can read their product files"
-- only accepted status = 'paid', which meant customers who completed a purchase
-- via Lemon Squeezy could see their orders but could NOT download files.
--
-- This migration corrects the policy to accept both valid settled statuses.
--
-- Safe, idempotent, non-destructive. No DROP of existing tables/columns.
-- ============================================================================

drop policy if exists "Purchasers can read their product files" on public.product_files;

create policy "Purchasers can read their product files"
  on public.product_files for select
  using (
    exists (
      select 1
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.user_id = auth.uid()
        and o.status in ('paid', 'completed')
        and oi.product_id = product_files.product_id
    )
  );
