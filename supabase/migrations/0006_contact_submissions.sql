-- ============================================================================
-- AXION Marketplace — Contact submissions
-- ============================================================================
-- Adds a contact_submissions table so the public contact form can store
-- inquiries when no transactional email provider is configured.
--
-- Safe, idempotent, non-destructive.

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

create policy "Admins can read contact submissions"
  on public.contact_submissions for select
  using (
    exists (
      select 1
      from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'admin'
    )
  );

create policy "Anyone can insert contact submissions"
  on public.contact_submissions for insert
  with check (true);
