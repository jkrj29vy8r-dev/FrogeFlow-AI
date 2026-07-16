-- BookForge AI — Initial Schema
-- =====================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

create type plan_type as enum ('free', 'pro', 'enterprise');

create type document_type as enum (
  'ebook',
  'pdf_guide',
  'workbook',
  'checklist',
  'lead_magnet',
  'landing_page',
  'sales_page',
  'product_description',
  'marketing_content',
  'social_post',
  'email_campaign'
);

create type document_status as enum ('draft', 'published', 'archived');

-- =====================================================
-- PROFILES
-- =====================================================

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text,
  avatar_url  text,
  plan        plan_type not null default 'free',
  credits     integer not null default 3 check (credits >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- Trigger to update updated_at
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute procedure public.update_updated_at_column();

-- =====================================================
-- DOCUMENTS
-- =====================================================

create table public.documents (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  type        document_type not null,
  content     jsonb not null default '{}',
  status      document_status not null default 'draft',
  word_count  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger documents_updated_at
  before update on public.documents
  for each row
  execute procedure public.update_updated_at_column();

-- Index for fast user queries
create index documents_user_id_idx on public.documents(user_id);
create index documents_type_idx on public.documents(type);
create index documents_status_idx on public.documents(status);
create index documents_created_at_idx on public.documents(created_at desc);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Profiles: users can only see/update their own
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Documents: users can only CRUD their own
alter table public.documents enable row level security;

create policy "documents_select_own"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "documents_insert_own"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "documents_update_own"
  on public.documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "documents_delete_own"
  on public.documents for delete
  using (auth.uid() = user_id);
