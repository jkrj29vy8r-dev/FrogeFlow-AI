-- ============================================================
-- Stripe subscriptions + usage events
-- ============================================================

-- ---- subscriptions ------------------------------------------
create table public.subscriptions (
  id                    text primary key,           -- Stripe subscription ID
  user_id               uuid not null references public.profiles(id) on delete cascade,
  status                text not null,              -- active | canceled | past_due | trialing | etc.
  price_id              text not null,              -- Stripe price ID
  quantity              integer not null default 1,
  cancel_at_period_end  boolean not null default false,
  current_period_start  timestamptz not null,
  current_period_end    timestamptz not null,
  cancel_at             timestamptz,
  canceled_at           timestamptz,
  trial_start           timestamptz,
  trial_end             timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_status_idx  on public.subscriptions(status);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.update_updated_at_column();

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ---- usage_events -------------------------------------------
create table public.usage_events (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  document_id   uuid references public.documents(id) on delete set null,
  event_type    text not null,  -- 'outline_generated' | 'section_generated' | 'export_pdf' | etc.
  credits_used  integer not null default 0,
  metadata      jsonb not null default '{}',
  created_at    timestamptz not null default now()
);

create index usage_events_user_id_idx    on public.usage_events(user_id);
create index usage_events_created_at_idx on public.usage_events(created_at desc);

alter table public.usage_events enable row level security;

create policy "usage_events_select_own"
  on public.usage_events for select
  using (auth.uid() = user_id);

create policy "usage_events_insert_own"
  on public.usage_events for insert
  with check (auth.uid() = user_id);
