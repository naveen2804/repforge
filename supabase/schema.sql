-- RepForge schema — run this once in the Supabase SQL editor.
-- Every table is scoped to the signed-in user and protected by row level security,
-- so the three of you never see each other's data even though you share a project.

-- ---------------------------------------------------------------------------
-- Profiles: maps a username onto the auth user, and holds per-user preferences.
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  unit text not null default 'kg' check (unit in ('kg', 'lb')),
  created_at timestamptz not null default now()
);

-- Usernames are case-insensitive: "Naveen" and "naveen" are the same account.
create unique index if not exists profiles_username_lower_idx on profiles (lower(username));

-- ---------------------------------------------------------------------------
-- Workout sessions
-- ---------------------------------------------------------------------------
create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  name text,
  template_key text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists workout_sessions_user_started_idx
  on workout_sessions (user_id, started_at desc);

-- ---------------------------------------------------------------------------
-- Exercises performed within a session.
-- exercise_id references the static catalogue in public/exercises.json, not a table.
-- ---------------------------------------------------------------------------
create table if not exists session_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  session_id uuid not null references workout_sessions(id) on delete cascade,
  exercise_id text not null,
  order_index int not null default 0,
  notes text
);

create index if not exists session_exercises_session_idx on session_exercises (session_id);
create index if not exists session_exercises_user_exercise_idx on session_exercises (user_id, exercise_id);

-- ---------------------------------------------------------------------------
-- Individual sets
-- ---------------------------------------------------------------------------
create table if not exists sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  session_exercise_id uuid not null references session_exercises(id) on delete cascade,
  set_number int not null,
  reps int,
  weight_kg numeric,
  duration_seconds int,
  rpe numeric,
  completed boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists sets_session_exercise_idx on sets (session_exercise_id);
create index if not exists sets_user_idx on sets (user_id);

-- ---------------------------------------------------------------------------
-- Favourites
-- ---------------------------------------------------------------------------
create table if not exists favorites (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  exercise_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

-- ---------------------------------------------------------------------------
-- User-defined split templates, on top of the built-in ones
-- ---------------------------------------------------------------------------
create table if not exists custom_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  exercise_ids text[] not null,
  created_at timestamptz not null default now()
);

create index if not exists custom_templates_user_idx on custom_templates (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row level security: you can only touch rows you own.
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table workout_sessions enable row level security;
alter table session_exercises enable row level security;
alter table sets enable row level security;
alter table favorites enable row level security;
alter table custom_templates enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['workout_sessions', 'session_exercises', 'sets', 'favorites', 'custom_templates']
  loop
    execute format('drop policy if exists %I on %I', t || '_owner', t);
    execute format(
      'create policy %I on %I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t || '_owner', t
    );
  end loop;
end $$;

drop policy if exists profiles_self_select on profiles;
create policy profiles_self_select on profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists profiles_self_insert on profiles;
create policy profiles_self_insert on profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists profiles_self_update on profiles;
create policy profiles_self_update on profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Username availability check.
--
-- Sign-up needs to know whether a username is taken *before* the account exists,
-- so this runs as security definer and deliberately leaks nothing but a boolean.
-- ---------------------------------------------------------------------------
create or replace function username_available(candidate text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (select 1 from profiles where lower(username) = lower(trim(candidate)));
$$;

grant execute on function username_available(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Keep profiles in step with auth.users: the username chosen at sign-up is passed
-- through as user metadata, and this trigger materialises the profile row.
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
