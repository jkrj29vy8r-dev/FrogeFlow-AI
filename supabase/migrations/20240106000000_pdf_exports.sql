-- ── PDF Exports ────────────────────────────────────────────────────────────────
-- Stores export job metadata and settings for the PDF export system.
-- The PDF itself is generated on demand; this table stores history/settings.

create type export_status as enum ('pending', 'generating', 'completed', 'failed');

create table if not exists pdf_exports (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  document_id       uuid not null,
  document_title    text not null,
  document_type     text not null default 'ebook',
  status            export_status not null default 'pending',
  settings          jsonb not null default '{}'::jsonb,
  file_name         text,
  error_message     text,
  download_count    integer not null default 0,
  page_count        integer,
  file_size_bytes   bigint,
  created_at        timestamptz not null default now(),
  completed_at      timestamptz
);

-- Row-level security
alter table pdf_exports enable row level security;

create policy "Users can read their own exports"
  on pdf_exports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own exports"
  on pdf_exports for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own exports"
  on pdf_exports for update
  using (auth.uid() = user_id);

create policy "Users can delete their own exports"
  on pdf_exports for delete
  using (auth.uid() = user_id);

-- Indexes
create index pdf_exports_user_id_idx on pdf_exports (user_id, created_at desc);
create index pdf_exports_document_id_idx on pdf_exports (document_id);
