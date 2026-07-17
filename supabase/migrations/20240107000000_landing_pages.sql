-- ── Landing Pages ────────────────────────────────────────────────────────────
-- AI-powered landing & sales page generator

create type landing_page_type as enum ('landing', 'sales', 'lead_magnet', 'thank_you', 'coming_soon');

create table if not exists landing_pages (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  page_type     landing_page_type not null default 'landing',
  status        text not null default 'draft', -- draft | published
  input         jsonb not null default '{}'::jsonb,  -- original form inputs
  seo           jsonb not null default '{}'::jsonb,  -- meta, og, twitter, schema
  settings      jsonb not null default '{}'::jsonb,  -- colors, fonts, logo
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists landing_page_sections (
  id            uuid primary key default gen_random_uuid(),
  page_id       uuid not null references landing_pages(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  section_type  text not null,
  position      integer not null default 0,
  is_visible    boolean not null default true,
  content       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Row-level security
alter table landing_pages enable row level security;
alter table landing_page_sections enable row level security;

create policy "Users can read their own landing pages"
  on landing_pages for select using (auth.uid() = user_id);
create policy "Users can insert their own landing pages"
  on landing_pages for insert with check (auth.uid() = user_id);
create policy "Users can update their own landing pages"
  on landing_pages for update using (auth.uid() = user_id);
create policy "Users can delete their own landing pages"
  on landing_pages for delete using (auth.uid() = user_id);

create policy "Users can read their own page sections"
  on landing_page_sections for select using (auth.uid() = user_id);
create policy "Users can insert their own page sections"
  on landing_page_sections for insert with check (auth.uid() = user_id);
create policy "Users can update their own page sections"
  on landing_page_sections for update using (auth.uid() = user_id);
create policy "Users can delete their own page sections"
  on landing_page_sections for delete using (auth.uid() = user_id);

-- Indexes
create index landing_pages_user_id_idx on landing_pages (user_id, created_at desc);
create index landing_page_sections_page_id_idx on landing_page_sections (page_id, position);
