-- ============================================================================
-- AXION Marketplace — Milestone 7: Supabase Storage for Product Files
-- ============================================================================
-- This migration creates the `product-files` storage bucket used by the admin
-- file upload flow and the download delivery route.
--
-- IMPORTANT: Supabase Storage buckets are created via the Dashboard or the
-- Storage API. This file documents the expected bucket configuration and
-- provides the SQL policy setup for the underlying storage.objects table.
--
-- Create the bucket in Supabase Dashboard → Storage → New bucket:
--   Name: product-files
--   Public: OFF (private)
--   File size limit: 100 MB (adjust as needed)
--   Allowed MIME types: */*
--
-- After creating the bucket, run this migration to lock down RLS on the
-- storage.objects table so only admins can upload and only purchasers can
-- download through the application route (not directly).

-- ---------------------------------------------------------------------------
-- 1. STORAGE POLICIES
-- ---------------------------------------------------------------------------
-- Allow admins to upload/update/delete objects in the product-files bucket.
drop policy if exists "Admins can manage product-files storage objects" on storage.objects;
create policy "Admins can manage product-files storage objects"
  on storage.objects for all
  using (bucket_id = 'product-files' and public.is_admin())
  with check (bucket_id = 'product-files' and public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. GRANTS
-- ---------------------------------------------------------------------------
-- Ensure the authenticated role has minimal access. Actual object access is
-- governed by the policies above; the download API route uses a signed URL
-- so end-users do not need direct storage permissions.
grant usage on schema storage to anon, authenticated;
