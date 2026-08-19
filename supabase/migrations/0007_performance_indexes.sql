-- ============================================================================
-- AXION Marketplace — Milestone 7: Performance indexes
-- ============================================================================
-- Adds composite indexes that match the actual query patterns used by
-- the application. These are additive only and safe to run on existing data.

-- Dashboard / purchases / downloads pages filter orders by user + status
-- and order by created_at. A composite index lets Postgres satisfy the
-- filter and sort from the index alone.
create index if not exists idx_orders_user_id_status_created_at
  on public.orders (user_id, status, created_at desc);

-- Admin orders page queries by status and created_at without user filter.
create index if not exists idx_orders_status_created_at
  on public.orders (status, created_at desc);

-- Product files are looked up by product_id for download serving.
create index if not exists idx_product_files_product_id_created_at
  on public.product_files (product_id, created_at desc);

-- Download records are queried per-user for the downloads page.
create index if not exists idx_download_records_user_id_created_at
  on public.download_records (user_id, created_at desc);

-- Contact submissions are read by admins; a created_at index helps sorting.
create index if not exists idx_contact_submissions_created_at
  on public.contact_submissions (created_at desc);
