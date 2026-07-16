-- Add soft delete support to documents
alter table public.documents
  add column if not exists deleted_at timestamptz;

-- Index for filtering non-deleted documents
create index if not exists documents_deleted_at_idx
  on public.documents(deleted_at)
  where deleted_at is null;

-- Update RLS: exclude soft-deleted rows from select
drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own"
  on public.documents for select
  using (auth.uid() = user_id and deleted_at is null);
