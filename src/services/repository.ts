import { supabase } from '../lib/supabase';
import {
  BaseDriver,
  BaseTeam,
  ChampionshipEntry,
  Country,
  GameWorld,
  PlayerCareer,
  Profile,
  Race,
  RaceResult,
  Season,
  SeasonRound,
  Series,
  WorldDriver,
  WorldTeam,
} from '../types/database';
import { INITIAL_BASE_DRIVERS, INITIAL_BASE_TEAMS, INITIAL_COUNTRIES, INITIAL_SERIES } from './catalogData';
import { CreateNewCareerPayload, UniverseCreationResult } from '../game/world/creation';
import { simulateF4Weekend, WeekendSimulation } from '../game/racing/simulateWeekend';

export interface DriverFilters {
  seriesId?: string;
  teamId?: string;
  countryId?: string;
  status?: string;
  search?: string;
}

export interface IDataRepository {
  signUp(email: string, password: string, username: string): Promise<{ user: Profile | null; error: string | null; message?: string | null }>;
  signIn(email: string, password: string): Promise<{ user: Profile | null; error: string | null }>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<Profile | null>;
  getCountries(): Promise<Country[]>;
  getSeries(): Promise<Series[]>;
  getBaseTeams(): Promise<BaseTeam[]>;
  getBaseDrivers(): Promise<BaseDriver[]>;
  listWorlds(userId: string): Promise<GameWorld[]>;
  getWorld(worldId: string): Promise<GameWorld | null>;
  createWorld(payload: CreateNewCareerPayload): Promise<UniverseCreationResult>;
  deleteWorld(worldId: string): Promise<boolean>;
  getWorldTeams(worldId: string): Promise<WorldTeam[]>;
  getWorldTeam(worldId: string, teamId: string): Promise<WorldTeam | null>;
  getWorldDrivers(worldId: string, filters?: DriverFilters): Promise<WorldDriver[]>;
  getWorldDriver(worldId: string, driverId: string): Promise<WorldDriver | null>;
  getPlayerCareer(worldId: string): Promise<PlayerCareer | null>;
  getPlayerDriver(worldId: string): Promise<WorldDriver | null>;
  getCurrentSeason(worldId: string): Promise<Season | null>;
  getSeasonRounds(worldId: string, seasonId: string): Promise<SeasonRound[]>;
  getChampionshipEntries(worldId: string, seasonId: string): Promise<ChampionshipEntry[]>;
  getRacesByRound(worldId: string, roundId: string): Promise<Race[]>;
  getRaceResults(worldId: string, raceId: string): Promise<RaceResult[]>;
  playNextRound(worldId: string): Promise<WeekendSimulation>;
}

function unavailableError() {
  return 'O serviço do jogo ainda não foi conectado. Tente novamente mais tarde.';
}

class UnavailableRepository implements IDataRepository {
  async signUp() { return { user: null, error: unavailableError(), message: null }; }
  async signIn() { return { user: null, error: unavailableError() }; }
  async signOut() {}
  async getCurrentUser() { return null; }
  async getCountries() { return INITIAL_COUNTRIES; }
  async getSeries() { return INITIAL_SERIES; }
  async getBaseTeams() { return INITIAL_BASE_TEAMS; }
  async getBaseDrivers() { return INITIAL_BASE_DRIVERS; }
  async listWorlds() { return []; }
  async getWorld() { return null; }
  async createWorld(): Promise<UniverseCreationResult> { throw new Error(unavailableError()); }
  async deleteWorld() { return false; }
  async getWorldTeams() { return []; }
  async getWorldTeam() { return null; }
  async getWorldDrivers() { return []; }
  async getWorldDriver() { return null; }
  async getPlayerCareer() { return null; }
  async getPlayerDriver() { return null; }
  async getCurrentSeason() { return null; }
  async getSeasonRounds() { return []; }
  async getChampionshipEntries() { return []; }
  async getRacesByRound() { return []; }
  async getRaceResults() { return []; }
  async playNextRound(): Promise<WeekendSimulation> { throw new Error(unavailableError()); }
}

class SupabaseRepository implements IDataRepository {
  private client() {
    if (!supabase) throw new Error(unavailableError());
    return supabase;
  }

  async signUp(email: string, password: string, username: string) {
    const sb = this.client();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim() } },
    });
    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Não foi possível criar a conta.' };
    if (!data.session) {
      return { user: null, error: null, message: 'Conta criada. Confirme seu email e depois entre no jogo.' };
    }
    return {
      user: {
        id: data.user.id,
        username: username.trim(),
        email: data.user.email || email,
        created_at: data.user.created_at,
        updated_at: data.user.created_at,
      },
      error: null,
      message: null,
    };
  }

  async signIn(email: string, password: string) {
    const sb = this.client();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Usuário não encontrado.' };
    const { data: profile } = await sb.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
    return {
      user: profile || {
        id: data.user.id,
        username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'Piloto',
        email: data.user.email || undefined,
        created_at: data.user.created_at,
        updated_at: data.user.created_at,
      },
      error: null,
    };
  }

  async signOut() { await this.client().auth.signOut(); }

  async getCurrentUser(): Promise<Profile | null> {
    const sb = this.client();
    const { data, error } = await sb.auth.getUser();
    if (error || !data.user) return null;
    const { data: profile } = await sb.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
    return profile || {
      id: data.user.id,
      username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'Piloto',
      email: data.user.email || undefined,
      created_at: data.user.created_at,
      updated_at: data.user.created_at,
    };
  }

  async getCountries() {
    const { data, error } = await this.client().from('countries').select('*').eq('active', true).order('name');
    return error || !data?.length ? INITIAL_COUNTRIES : data;
  }
  async getSeries() {
    const { data, error } = await this.client().from('series').select('*').eq('active', true).order('order_index');
    return error || !data?.length ? INITIAL_SERIES : data;
  }
  async getBaseTeams() {
    const { data, error } = await this.client().from('base_teams').select('*').order('name');
    return error || !data?.length ? INITIAL_BASE_TEAMS : data;
  }
  async getBaseDrivers() {
    const { data, error } = await this.client().from('base_drivers').select('*').eq('active', true).order('last_name');
    return error || !data?.length ? INITIAL_BASE_DRIVERS : data;
  }

  async listWorlds(userId: string) {
    const { data, error } = await this.client().from('game_worlds').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
    if (error) throw new Error('Não foi possível carregar suas carreiras.');
    return data || [];
  }
  async getWorld(worldId: string) {
    const { data } = await this.client().from('game_worlds').select('*').eq('id', worldId).maybeSingle();
    return data || null;
  }

  async createWorld(payload: CreateNewCareerPayload): Promise<UniverseCreationResult> {
    const sb = this.client();
    const { data, error } = await sb.rpc('create_new_career', {
      p_first_name: payload.firstName || 'Piloto',
      p_last_name: payload.lastName,
      p_country_id: payload.countryId,
      p_racing_number: payload.racingNumber,
      p_driving_style: payload.drivingStyle,
    });
    if (error || !data?.world_id) throw new Error(error?.message || 'Não foi possível criar a carreira.');
    const worldId = data.world_id as string;
    const [gameWorld, playerCareer, playerDriver, worldTeams, worldDrivers, season] = await Promise.all([
      this.getWorld(worldId), this.getPlayerCareer(worldId), this.getPlayerDriver(worldId), this.getWorldTeams(worldId), this.getWorldDrivers(worldId), this.getCurrentSeason(worldId),
    ]);
    if (!gameWorld || !playerCareer || !playerDriver || !season) throw new Error('A carreira foi criada, mas não pôde ser carregada.');
    return { gameWorld, playerCareer, playerDriver, worldTeams, worldDrivers, season, contracts: [], careerEvents: [], historicEvents: [] };
  }

  async deleteWorld(worldId: string) {
    const { error } = await this.client().from('game_worlds').delete().eq('id', worldId);
    return !error;
  }
  async getWorldTeams(worldId: string) {
    const { data, error } = await this.client().from('world_teams').select('*').eq('world_id', worldId).order('performance', { ascending: false });
    if (error) return [];
    return data || [];
  }
  async getWorldTeam(worldId: string, teamId: string) {
    const { data } = await this.client().from('world_teams').select('*').eq('world_id', worldId).eq('id', teamId).maybeSingle();
    return data || null;
  }
  async getWorldDrivers(worldId: string, filters?: DriverFilters) {
    let q = this.client().from('world_drivers').select('*').eq('world_id', worldId);
    if (filters?.seriesId && filters.seriesId !== 'all') q = q.eq('current_series_id', filters.seriesId);
    if (filters?.teamId && filters.teamId !== 'all') q = q.eq('current_team_id', filters.teamId);
    if (filters?.countryId && filters.countryId !== 'all') q = q.eq('nationality_country_id', filters.countryId);
    if (filters?.status && filters.status !== 'all') q = q.eq('career_status', filters.status);
    if (filters?.search?.trim()) q = q.or(`first_name.ilike.%${filters.search.trim()}%,last_name.ilike.%${filters.search.trim()}%`);
    const { data, error } = await q.order('overall', { ascending: false });
    return error ? [] : (data || []);
  }
  async getWorldDriver(worldId: string, driverId: string) {
    const { data } = await this.client().from('world_drivers').select('*').eq('world_id', worldId).eq('id', driverId).maybeSingle();
    return data || null;
  }
  async getPlayerCareer(worldId: string) {
    const { data } = await this.client().from('player_careers').select('*').eq('world_id', worldId).maybeSingle();
    return data || null;
  }
  async getPlayerDriver(worldId: string) {
    const pc = await this.getPlayerCareer(worldId);
    return pc ? this.getWorldDriver(worldId, pc.driver_id) : null;
  }
  async getCurrentSeason(worldId: string) {
    const world = await this.getWorld(worldId);
    if (!world?.current_season_id) return null;
    const { data } = await this.client().from('seasons').select('*').eq('id', world.current_season_id).maybeSingle();
    return data || null;
  }
  async getSeasonRounds(worldId: string, seasonId: string) {
    const { data, error } = await this.client().from('season_rounds').select('*').eq('world_id', worldId).eq('season_id', seasonId).order('round_number');
    return error ? [] : (data || []);
  }
  async getChampionshipEntries(worldId: string, seasonId: string) {
    const { data, error } = await this.client().from('championship_entries').select('*').eq('world_id', worldId).eq('season_id', seasonId).order('points', { ascending: false }).order('wins', { ascending: false });
    return error ? [] : (data || []);
  }
  async getRacesByRound(worldId: string, roundId: string) {
    const { data, error } = await this.client().from('races').select('*').eq('world_id', worldId).eq('round_id', roundId).order('race_number');
    return error ? [] : (data || []);
  }
  async getRaceResults(worldId: string, raceId: string) {
    const { data, error } = await this.client().from('race_results').select('*').eq('world_id', worldId).eq('race_id', raceId).order('finish_position', { ascending: true, nullsFirst: false });
    return error ? [] : (data || []);
  }

  async playNextRound(worldId: string): Promise<WeekendSimulation> {
    const world = await this.getWorld(worldId);
    const season = await this.getCurrentSeason(worldId);
    if (!world || !season) throw new Error('Temporada não encontrada.');
    if (season.status === 'completed') throw new Error('A temporada já terminou.');
    const [rounds, drivers, teams] = await Promise.all([
      this.getSeasonRounds(worldId, season.id),
      this.getWorldDrivers(worldId, { seriesId: season.series_id, status: 'active' }),
      this.getWorldTeams(worldId),
    ]);
    const round = rounds.find((r: SeasonRound) => r.status === 'scheduled');
    if (!round) throw new Error('Não há próxima etapa disponível.');
    const simulation = simulateF4Weekend(world.seed, round, drivers, teams);
    const { error } = await this.client().rpc('commit_round_results', {
      p_world_id: worldId,
      p_round_id: round.id,
      p_payload: simulation,
    });
    if (error) throw new Error(error.message || 'Não foi possível salvar a etapa.');
    return simulation;
  }
}

export const repository: IDataRepository = supabase ? new SupabaseRepository() : new UnavailableRepository();
export const getRepository = () => repository;
