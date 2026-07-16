-- BookForge AI Engine — Database Schema
-- =====================================================

-- =====================================================
-- ALTER DOCUMENTS TABLE
-- =====================================================

alter table public.documents
  add column if not exists generation_status text not null default 'pending'
    check (generation_status in (
      'pending', 'generating_outline', 'outline_ready',
      'generating_content', 'completed', 'failed', 'cancelled'
    )),
  add column if not exists ai_metadata jsonb not null default '{}';

create index if not exists documents_generation_status_idx
  on public.documents(generation_status);

-- =====================================================
-- SECTIONS TABLE
-- =====================================================

create table if not exists public.sections (
  id                  uuid primary key default uuid_generate_v4(),
  document_id         uuid not null references public.documents(id) on delete cascade,
  user_id             uuid not null references public.profiles(id) on delete cascade,
  position            integer not null,
  title               text not null,
  content             text not null default '',
  section_type        text not null default 'chapter'
    check (section_type in (
      'introduction', 'chapter', 'subchapter',
      'conclusion', 'cta', 'checklist_group', 'exercise', 'tips'
    )),
  description         text not null default '',
  word_count          integer not null default 0,
  is_generated        boolean not null default false,
  generation_status   text not null default 'pending'
    check (generation_status in ('pending', 'generating', 'completed', 'failed')),
  ai_metadata         jsonb not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger sections_updated_at
  before update on public.sections
  for each row
  execute procedure public.update_updated_at_column();

create index if not exists sections_document_id_idx on public.sections(document_id);
create index if not exists sections_user_id_idx on public.sections(user_id);
create index if not exists sections_position_idx on public.sections(document_id, position);

-- RLS
alter table public.sections enable row level security;

create policy "sections_select_own"
  on public.sections for select
  using (auth.uid() = user_id);

create policy "sections_insert_own"
  on public.sections for insert
  with check (auth.uid() = user_id);

create policy "sections_update_own"
  on public.sections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sections_delete_own"
  on public.sections for delete
  using (auth.uid() = user_id);

-- =====================================================
-- SECTION VERSIONS TABLE
-- =====================================================

create table if not exists public.section_versions (
  id          uuid primary key default uuid_generate_v4(),
  section_id  uuid not null references public.sections(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  word_count  integer not null default 0,
  version     integer not null,
  created_at  timestamptz not null default now()
);

create index if not exists section_versions_section_id_idx
  on public.section_versions(section_id, version desc);

-- RLS
alter table public.section_versions enable row level security;

create policy "section_versions_select_own"
  on public.section_versions for select
  using (auth.uid() = user_id);

create policy "section_versions_insert_own"
  on public.section_versions for insert
  with check (auth.uid() = user_id);

-- =====================================================
-- HELPER: count words in text
-- =====================================================

create or replace function public.count_words(input text)
returns integer
language sql
immutable
as $$
  select coalesce(
    array_length(
      regexp_split_to_array(trim(input), '\s+'),
      1
    ),
    0
  );
$$;
