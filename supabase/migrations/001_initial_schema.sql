-- APEX CAREER - banco principal (Supabase/PostgreSQL)
-- Projetado para um projeto Supabase vazio.

create extension if not exists pgcrypto;
create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 2 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.countries (
  id text primary key,
  name text not null,
  code text not null unique,
  flag_emoji text not null default '🏁',
  regen_weight integer not null default 100 check (regen_weight > 0),
  active boolean not null default true
);

create table public.series (
  id text primary key,
  name text not null,
  short_name text not null,
  tier integer not null check (tier between 1 and 10),
  description text,
  order_index integer not null default 0,
  active boolean not null default true
);

create table public.base_teams (
  id text primary key,
  name text not null,
  country_id text references public.countries(id),
  primary_color text not null,
  secondary_color text not null,
  starting_series_id text not null references public.series(id),
  created_at timestamptz not null default now()
);

create table public.base_drivers (
  id text primary key,
  first_name text not null,
  last_name text not null,
  nationality_country_id text references public.countries(id),
  birth_date date,
  starting_overall integer not null check (starting_overall between 20 and 99),
  potential integer not null check (potential between 20 and 99),
  starting_series_id text not null references public.series(id),
  starting_team_id text references public.base_teams(id),
  racing_number integer check (racing_number between 1 and 99),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.game_worlds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  start_year integer not null default 2026,
  current_year integer not null default 2026,
  current_season_id uuid,
  seed text not null,
  status text not null default 'active' check (status in ('active','completed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.game_worlds(id) on delete cascade,
  year integer not null,
  series_id text not null references public.series(id),
  status text not null default 'in_progress' check (status in ('not_started','in_progress','completed')),
  current_round integer not null default 1 check (current_round >= 1),
  created_at timestamptz not null default now(),
  unique (world_id, year, series_id)
);

alter table public.game_worlds
  add constraint fk_game_worlds_current_season
  foreign key (current_season_id) references public.seasons(id) on delete set null;

create table public.world_teams (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.game_worlds(id) on delete cascade,
  base_team_id text references public.base_teams(id) on delete set null,
  origin text not null check (origin in ('real','generated')),
  name text not null,
  country_id text references public.countries(id),
  primary_color text not null,
  secondary_color text not null,
  current_series_id text not null references public.series(id),
  performance integer not null default 50 check (performance between 1 and 100),
  reliability integer not null default 70 check (reliability between 1 and 100),
  budget bigint not null default 0 check (budget >= 0),
  facilities integer not null default 50 check (facilities between 1 and 100),
  development integer not null default 50 check (development between 1 and 100),
  prestige integer not null default 50 check (prestige between 1 and 100),
  academy_quality integer not null default 50 check (academy_quality between 1 and 100),
  active boolean not null default true,
  founded_year integer not null default 2026,
  closed_year integer,
  created_at timestamptz not null default now(),
  unique (world_id, base_team_id)
);

create table public.world_drivers (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.game_worlds(id) on delete cascade,
  base_driver_id text references public.base_drivers(id) on delete set null,
  origin text not null check (origin in ('real','regen','player')),
  first_name text not null,
  last_name text not null,
  nationality_country_id text references public.countries(id),
  birth_date date,
  overall integer not null check (overall between 20 and 99),
  potential integer not null check (potential between 20 and 99),
  qualifying integer not null default 50 check (qualifying between 1 and 99),
  racecraft integer not null default 50 check (racecraft between 1 and 99),
  consistency integer not null default 50 check (consistency between 1 and 99),
  wet_skill integer not null default 50 check (wet_skill between 1 and 99),
  aggression integer not null default 50 check (aggression between 1 and 99),
  tyre_management integer not null default 50 check (tyre_management between 1 and 99),
  starts integer not null default 50 check (starts between 1 and 99),
  defending integer not null default 50 check (defending between 1 and 99),
  overtaking integer not null default 50 check (overtaking between 1 and 99),
  adaptability integer not null default 50 check (adaptability between 1 and 99),
  experience integer not null default 20 check (experience between 1 and 99),
  confidence integer not null default 50 check (confidence between 1 and 99),
  racing_number integer check (racing_number between 1 and 99),
  current_team_id uuid references public.world_teams(id) on delete set null,
  current_series_id text references public.series(id),
  reputation integer not null default 25 check (reputation between 1 and 100),
  fame integer not null default 5 check (fame between 1 and 100),
  career_status text not null default 'active' check (career_status in ('active','reserve','retired')),
  debut_year integer not null default 2026,
  retirement_year integer,
  generated_seed text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (world_id, base_driver_id)
);

create table public.player_careers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  world_id uuid not null unique references public.game_worlds(id) on delete cascade,
  driver_id uuid not null unique references public.world_drivers(id) on delete cascade,
  racing_number integer not null check (racing_number between 1 and 99),
  driving_style text not null check (driving_style in ('Agressivo','Técnico','Consistente','Calculista','Instintivo')),
  difficulty text not null default 'normal',
  career_started_at timestamptz not null default now(),
  career_completed_at timestamptz,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.season_rounds (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.game_worlds(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  round_number integer not null check (round_number > 0),
  name text not null,
  circuit_name text not null,
  country_id text not null references public.countries(id),
  event_date date not null,
  status text not null default 'scheduled' check (status in ('scheduled','completed')),
  created_at timestamptz not null default now(),
  unique (season_id, round_number)
);

create table public.championship_entries (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.game_worlds(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  team_id uuid not null references public.world_teams(id) on delete cascade,
  driver_id uuid not null references public.world_drivers(id) on delete cascade,
  car_number integer not null check (car_number between 1 and 99),
  points integer not null default 0 check (points >= 0),
  wins integer not null default 0 check (wins >= 0),
  podiums integer not null default 0 check (podiums >= 0),
  poles integer not null default 0 check (poles >= 0),
  created_at timestamptz not null default now(),
  unique (season_id, driver_id)
);

create table public.races (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.game_worlds(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  round_id uuid not null references public.season_rounds(id) on delete cascade,
  round_number integer not null,
  race_number integer not null check (race_number between 1 and 3),
  race_format text not null check (race_format in ('long','short')),
  name text not null,
  circuit_name text not null,
  country_id text not null references public.countries(id),
  laps integer not null default 0 check (laps >= 0),
  status text not null default 'finished' check (status in ('scheduled','in_progress','finished')),
  created_at timestamptz not null default now(),
  unique (round_id, race_number)
);

create table public.race_results (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.game_worlds(id) on delete cascade,
  race_id uuid not null references public.races(id) on delete cascade,
  driver_id uuid not null references public.world_drivers(id) on delete cascade,
  team_id uuid not null references public.world_teams(id) on delete cascade,
  grid_position integer not null check (grid_position > 0),
  finish_position integer check (finish_position > 0),
  points_awarded integer not null default 0 check (points_awarded >= 0),
  fastest_lap boolean not null default false,
  dnf_reason text,
  created_at timestamptz not null default now(),
  unique (race_id, driver_id)
);

create table public.career_events (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.game_worlds(id) on delete cascade,
  player_career_id uuid not null references public.player_careers(id) on delete cascade,
  season_year integer not null,
  event_type text not null,
  title text not null,
  description text not null,
  impact_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.historic_events (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.game_worlds(id) on delete cascade,
  season_year integer not null,
  event_type text not null,
  headline text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create index idx_game_worlds_user on public.game_worlds(user_id);
create index idx_seasons_world on public.seasons(world_id);
create index idx_world_teams_world_series on public.world_teams(world_id,current_series_id);
create index idx_world_drivers_world_series on public.world_drivers(world_id,current_series_id);
create index idx_rounds_season on public.season_rounds(season_id,round_number);
create index idx_entries_season_points on public.championship_entries(season_id,points desc);
create index idx_races_round on public.races(round_id,race_number);
create index idx_results_race on public.race_results(race_id,finish_position);

-- Perfil criado automaticamente ao registrar uma conta.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  insert into public.profiles(id, username)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data->>'username'), ''), split_part(new.email, '@', 1), 'Piloto'))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();
