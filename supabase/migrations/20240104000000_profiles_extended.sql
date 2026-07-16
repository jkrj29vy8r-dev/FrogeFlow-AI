-- Add extended profile fields for authentication system

alter table public.profiles
  add column if not exists username text unique,
  add column if not exists language text not null default 'en',
  add column if not exists timezone text not null default 'UTC',
  add column if not exists last_login timestamptz;

-- Index for username lookups
create index if not exists profiles_username_idx on public.profiles (username);

-- Update trigger to generate username from email when not provided
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  counter int := 0;
begin
  -- Derive a base username from the email local part
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '', 'g'));
  if length(base_username) < 3 then
    base_username := 'user' || base_username;
  end if;
  -- Ensure uniqueness
  final_username := base_username;
  loop
    exit when not exists (select 1 from public.profiles where username = final_username);
    counter := counter + 1;
    final_username := base_username || counter::text;
  end loop;

  insert into public.profiles (id, email, full_name, avatar_url, username)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    final_username
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
