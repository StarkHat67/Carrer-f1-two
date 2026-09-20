-- Criação de carreira + commit transacional de fim de semana

create or replace function public.create_new_career(
  p_first_name text,
  p_last_name text,
  p_country_id text,
  p_racing_number integer,
  p_driving_style text
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_world uuid := gen_random_uuid();
  v_season uuid := gen_random_uuid();
  v_player uuid := gen_random_uuid();
  v_player_career uuid := gen_random_uuid();
  v_player_team uuid;
  v_seed text := upper(substr(encode(gen_random_bytes(8),'hex'),1,12));
  t record;
  d record;
  v_team uuid;
  v_ovr integer;
  v_q integer; v_r integer; v_c integer; v_w integer; v_a integer; v_ty integer;
  v_st integer; v_def integer; v_ot integer; v_ad integer; v_conf integer;
begin
  if v_user is null then raise exception 'Não autenticado'; end if;
  if nullif(trim(p_last_name),'') is null then raise exception 'Sobrenome obrigatório'; end if;
  if not exists(select 1 from public.countries where id=p_country_id and active) then raise exception 'País inválido'; end if;
  if p_racing_number not between 1 and 99 then raise exception 'Número inválido'; end if;
  if p_driving_style not in ('Agressivo','Técnico','Consistente','Calculista','Instintivo') then raise exception 'Estilo inválido'; end if;

  insert into public.game_worlds(id,user_id,name,start_year,current_year,seed,status)
  values(v_world,v_user,trim(coalesce(nullif(trim(p_first_name),''),'Piloto')||' '||trim(p_last_name)),2026,2026,v_seed,'active');

  insert into public.seasons(id,world_id,year,series_id,status,current_round)
  values(v_season,v_world,2026,'f4_brazil','in_progress',1);
  update public.game_worlds set current_season_id=v_season where id=v_world;

  create temp table tmp_team_map(base_id text primary key, world_id uuid not null) on commit drop;

  for t in select * from public.base_teams order by id loop
    v_team := gen_random_uuid();
    insert into tmp_team_map values(t.id,v_team);
    insert into public.world_teams(
      id,world_id,base_team_id,origin,name,country_id,primary_color,secondary_color,current_series_id,
      performance,reliability,budget,facilities,development,prestige,academy_quality,active,founded_year
    ) values(
      v_team,v_world,t.id,'real',t.name,t.country_id,t.primary_color,t.secondary_color,t.starting_series_id,
      case
        when t.id='f4_tmg' then 57 when t.id='f4_bassani' then 54 when t.id='f4_cavaleiro' then 51
        when t.starting_series_id='f1' then 84 + (abs(hashtextextended(v_seed||t.id,0)) % 8)::int
        when t.starting_series_id='f2' then 69 + (abs(hashtextextended(v_seed||t.id,0)) % 7)::int
        when t.starting_series_id='f3' then 59 + (abs(hashtextextended(v_seed||t.id,0)) % 7)::int
        else 50 end,
      72 + (abs(hashtextextended(v_seed||t.id||'rel',0)) % 12)::int,
      case t.starting_series_id when 'f1' then 150000000 when 'f2' then 15000000 when 'f3' then 8000000 else 3000000 end,
      50,55,case t.starting_series_id when 'f1' then 90 when 'f2' then 70 when 'f3' then 58 else 40 end,50,true,2026
    );
  end loop;

  select m.world_id into v_player_team
  from tmp_team_map m join public.base_teams bt on bt.id=m.base_id
  where bt.starting_series_id='f4_brazil'
  order by md5(v_seed||bt.id) limit 1;

  for d in select * from public.base_drivers where active order by id loop
    select world_id into v_team from tmp_team_map where base_id=d.starting_team_id;
    v_ovr := d.starting_overall;
    insert into public.world_drivers(
      world_id,base_driver_id,origin,first_name,last_name,nationality_country_id,birth_date,overall,potential,
      qualifying,racecraft,consistency,wet_skill,aggression,tyre_management,starts,defending,overtaking,adaptability,experience,confidence,
      racing_number,current_team_id,current_series_id,reputation,fame,career_status,debut_year,generated_seed
    ) values(
      v_world,d.id,'real',d.first_name,d.last_name,d.nationality_country_id,d.birth_date,v_ovr,d.potential,
      greatest(30,least(99,v_ovr + ((abs(hashtextextended(v_seed||d.id||'q',0))%7)::int-3))),
      greatest(30,least(99,v_ovr + ((abs(hashtextextended(v_seed||d.id||'r',0))%7)::int-2))),
      greatest(30,least(99,v_ovr + ((abs(hashtextextended(v_seed||d.id||'c',0))%7)::int-3))),
      greatest(30,least(99,v_ovr + ((abs(hashtextextended(v_seed||d.id||'w',0))%11)::int-5))),
      45 + (abs(hashtextextended(v_seed||d.id||'a',0))%36)::int,
      greatest(30,least(99,v_ovr + ((abs(hashtextextended(v_seed||d.id||'ty',0))%7)::int-3))),
      greatest(30,least(99,v_ovr + ((abs(hashtextextended(v_seed||d.id||'s',0))%7)::int-3))),
      greatest(30,least(99,v_ovr + ((abs(hashtextextended(v_seed||d.id||'d',0))%7)::int-3))),
      greatest(30,least(99,v_ovr + ((abs(hashtextextended(v_seed||d.id||'o',0))%7)::int-2))),
      greatest(30,least(99,v_ovr + ((abs(hashtextextended(v_seed||d.id||'ad',0))%9)::int-4))),
      greatest(15,least(99,v_ovr-10)),
      greatest(35,least(99,v_ovr + ((abs(hashtextextended(v_seed||d.id||'cf',0))%9)::int-4))),
      d.racing_number,v_team,d.starting_series_id,greatest(10,v_ovr-10),greatest(5,v_ovr-20),'active',2026,v_seed||':'||d.id
    );
  end loop;

  -- Base do jogador e modificadores do estilo
  v_q:=50; v_r:=50; v_c:=50; v_w:=50; v_a:=50; v_ty:=50; v_st:=50; v_def:=50; v_ot:=50; v_ad:=50; v_conf:=55;
  case p_driving_style
    when 'Agressivo' then v_a:=58;v_ot:=57;v_st:=55;v_ty:=46;v_c:=47;
    when 'Técnico' then v_q:=57;v_ad:=56;v_w:=55;v_def:=53;v_a:=47;
    when 'Consistente' then v_c:=58;v_ty:=57;v_def:=54;v_a:=46;v_q:=48;
    when 'Calculista' then v_ty:=58;v_r:=56;v_def:=55;v_ad:=54;v_a:=44;
    when 'Instintivo' then v_st:=57;v_r:=57;v_w:=55;v_conf:=60;v_c:=46;
  end case;
  v_ovr := round((v_q*.18)+(v_r*.20)+(v_c*.14)+(v_ty*.14)+(v_ot*.12)+(v_st*.08)+(v_w*.08)+(v_ad*.06));

  insert into public.world_drivers(
    id,world_id,origin,first_name,last_name,nationality_country_id,birth_date,overall,potential,qualifying,racecraft,consistency,wet_skill,aggression,
    tyre_management,starts,defending,overtaking,adaptability,experience,confidence,racing_number,current_team_id,current_series_id,reputation,fame,career_status,debut_year,generated_seed
  ) values(
    v_player,v_world,'player',coalesce(nullif(trim(p_first_name),''),'Piloto'),trim(p_last_name),p_country_id,date '2010-03-15',v_ovr,88,
    v_q,v_r,v_c,v_w,v_a,v_ty,v_st,v_def,v_ot,v_ad,16,v_conf,p_racing_number,v_player_team,'f4_brazil',25,5,'active',2026,v_seed||':player'
  );

  insert into public.player_careers(id,user_id,world_id,driver_id,racing_number,driving_style)
  values(v_player_career,v_user,v_world,v_player,p_racing_number,p_driving_style);

  -- Calendário-base da carreira 2026. A partir daqui o universo é simulado.
  insert into public.season_rounds(world_id,season_id,round_number,name,circuit_name,country_id,event_date) values
    (v_world,v_season,1,'Interlagos','Autódromo José Carlos Pace','BRA','2026-04-26'),
    (v_world,v_season,2,'Cuiabá','Autódromo Internacional de Mato Grosso','BRA','2026-06-20'),
    (v_world,v_season,3,'Velocittá','Autódromo Velo Città','BRA','2026-07-26'),
    (v_world,v_season,4,'Brasília','Autódromo Internacional de Brasília','BRA','2026-09-27'),
    (v_world,v_season,5,'Goiânia','Autódromo Internacional Ayrton Senna','BRA','2026-10-18'),
    (v_world,v_season,6,'Interlagos - GP São Paulo','Autódromo José Carlos Pace','BRA','2026-11-08'),
    (v_world,v_season,7,'Interlagos - Final','Autódromo José Carlos Pace','BRA','2026-12-13');

  insert into public.championship_entries(world_id,season_id,team_id,driver_id,car_number)
  select v_world,v_season,wd.current_team_id,wd.id,coalesce(wd.racing_number,99)
  from public.world_drivers wd
  where wd.world_id=v_world and wd.current_series_id='f4_brazil' and wd.current_team_id is not null;

  insert into public.career_events(world_id,player_career_id,season_year,event_type,title,description)
  values(v_world,v_player_career,2026,'debut','Sua carreira começou','Você assinou seu primeiro contrato na Fórmula 4 Brasil. Agora é pista.');

  return jsonb_build_object('world_id',v_world,'driver_id',v_player,'team_id',v_player_team,'season_id',v_season);
end;
$$;

revoke all on function public.create_new_career(text,text,text,integer,text) from public, anon;
grant execute on function public.create_new_career(text,text,text,integer,text) to authenticated;

create or replace function public.commit_round_results(
  p_world_id uuid,
  p_round_id uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_round public.season_rounds%rowtype;
  v_season public.seasons%rowtype;
  r jsonb; x jsonb; v_race uuid; v_driver uuid; v_team uuid; v_points int; v_finish int; v_grid int;
  v_pole uuid;
  v_player uuid;
  v_avg numeric;
  v_remaining int;
begin
  if v_user is null then raise exception 'Não autenticado'; end if;
  if not exists(select 1 from public.game_worlds where id=p_world_id and user_id=v_user) then raise exception 'Carreira inválida'; end if;
  select * into v_round from public.season_rounds where id=p_round_id and world_id=p_world_id for update;
  if not found or v_round.status <> 'scheduled' then raise exception 'Etapa indisponível'; end if;
  select * into v_season from public.seasons where id=v_round.season_id for update;
  v_pole := nullif(p_payload->>'pole_driver_id','')::uuid;

  for r in select value from jsonb_array_elements(p_payload->'races') loop
    v_race := gen_random_uuid();
    insert into public.races(id,world_id,season_id,round_id,round_number,race_number,race_format,name,circuit_name,country_id,laps,status)
    values(v_race,p_world_id,v_round.season_id,v_round.id,v_round.round_number,(r->>'race_number')::int,r->>'race_format',
      'Corrida '||(r->>'race_number'),v_round.circuit_name,v_round.country_id,0,'finished');

    for x in select value from jsonb_array_elements(r->'results') loop
      v_driver := (x->>'driver_id')::uuid; v_team := (x->>'team_id')::uuid;
      v_grid := (x->>'grid_position')::int; v_finish := nullif(x->>'finish_position','')::int; v_points := (x->>'points_awarded')::int;
      if not exists(select 1 from public.world_drivers where id=v_driver and world_id=p_world_id) then raise exception 'Piloto inválido'; end if;
      if not exists(select 1 from public.world_teams where id=v_team and world_id=p_world_id) then raise exception 'Equipe inválida'; end if;
      if v_points < 0 or v_points > 30 then raise exception 'Pontuação inválida'; end if;
      insert into public.race_results(world_id,race_id,driver_id,team_id,grid_position,finish_position,points_awarded,fastest_lap,dnf_reason)
      values(p_world_id,v_race,v_driver,v_team,v_grid,v_finish,v_points,coalesce((x->>'fastest_lap')::boolean,false),nullif(x->>'dnf_reason',''));

      update public.championship_entries set
        points=points+v_points,
        wins=wins+case when v_finish=1 then 1 else 0 end,
        podiums=podiums+case when v_finish between 1 and 3 then 1 else 0 end
      where season_id=v_round.season_id and driver_id=v_driver;
    end loop;
  end loop;

  if v_pole is not null then update public.championship_entries set poles=poles+1 where season_id=v_round.season_id and driver_id=v_pole; end if;
  update public.season_rounds set status='completed' where id=v_round.id;
  select count(*) into v_remaining from public.season_rounds where season_id=v_round.season_id and status='scheduled';
  if v_remaining=0 then
    update public.seasons set status='completed' where id=v_round.season_id;
  else
    update public.seasons set current_round=v_round.round_number+1 where id=v_round.season_id;
  end if;

  select pc.driver_id into v_player from public.player_careers pc where pc.world_id=p_world_id;
  select avg(rr.finish_position) into v_avg from public.race_results rr join public.races ra on ra.id=rr.race_id
    where ra.round_id=v_round.id and rr.driver_id=v_player and rr.finish_position is not null;
  if v_player is not null then
    update public.world_drivers set
      experience=least(99,experience+1),
      confidence=greatest(1,least(99,confidence + case when v_avg<=5 then 2 when v_avg<=10 then 1 else -1 end)),
      reputation=greatest(1,least(100,reputation + case when v_avg<=5 then 2 when v_avg<=10 then 1 else 0 end)),
      updated_at=now()
    where id=v_player;
  end if;

  return jsonb_build_object('round_id',v_round.id,'completed',true,'season_completed',v_remaining=0);
end;
$$;

revoke all on function public.commit_round_results(uuid,uuid,jsonb) from public, anon;
grant execute on function public.commit_round_results(uuid,uuid,jsonb) to authenticated;
