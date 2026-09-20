-- RLS e privilégios mínimos

alter table public.profiles enable row level security;
alter table public.countries enable row level security;
alter table public.series enable row level security;
alter table public.base_teams enable row level security;
alter table public.base_drivers enable row level security;
alter table public.game_worlds enable row level security;
alter table public.seasons enable row level security;
alter table public.world_teams enable row level security;
alter table public.world_drivers enable row level security;
alter table public.player_careers enable row level security;
alter table public.season_rounds enable row level security;
alter table public.championship_entries enable row level security;
alter table public.races enable row level security;
alter table public.race_results enable row level security;
alter table public.career_events enable row level security;
alter table public.historic_events enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy countries_read on public.countries for select to anon, authenticated using (true);
create policy series_read on public.series for select to anon, authenticated using (true);
create policy base_teams_read on public.base_teams for select to anon, authenticated using (true);
create policy base_drivers_read on public.base_drivers for select to anon, authenticated using (true);

create policy worlds_own_all on public.game_worlds for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy seasons_own_all on public.seasons for all to authenticated
using (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())))
with check (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())));

create policy world_teams_own_all on public.world_teams for all to authenticated
using (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())))
with check (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())));

create policy world_drivers_own_all on public.world_drivers for all to authenticated
using (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())))
with check (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())));

create policy player_careers_own_all on public.player_careers for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy rounds_own_all on public.season_rounds for all to authenticated
using (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())))
with check (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())));

create policy entries_own_all on public.championship_entries for all to authenticated
using (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())))
with check (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())));

create policy races_own_all on public.races for all to authenticated
using (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())))
with check (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())));

create policy results_own_all on public.race_results for all to authenticated
using (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())))
with check (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())));

create policy career_events_own_all on public.career_events for all to authenticated
using (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())))
with check (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())));

create policy historic_events_own_all on public.historic_events for all to authenticated
using (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())))
with check (exists (select 1 from public.game_worlds w where w.id=world_id and w.user_id=(select auth.uid())));

revoke all on all tables in schema public from anon, authenticated;
grant select on public.countries, public.series, public.base_teams, public.base_drivers to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.game_worlds, public.seasons, public.world_teams, public.world_drivers, public.player_careers, public.season_rounds, public.championship_entries, public.races, public.race_results, public.career_events, public.historic_events to authenticated;
