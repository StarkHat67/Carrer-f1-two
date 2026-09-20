/** Tipos centrais do domínio do jogo e da persistência. */

export type DriverOrigin = 'real' | 'regen' | 'player';
export type DriverStatus = 'active' | 'reserve' | 'retired';
export type DrivingStyle = 'Agressivo' | 'Técnico' | 'Consistente' | 'Calculista' | 'Instintivo';
export type WorldStatus = 'active' | 'completed' | 'archived';
export type SeasonStatus = 'not_started' | 'in_progress' | 'completed';
export type TeamOrigin = 'real' | 'generated';
export type ContractRole = 'first_driver' | 'second_driver' | 'reserve';

export interface Profile {
  id: string;
  username: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: string; // Ex: 'BRA'
  name: string;
  code: string;
  flag_emoji: string;
  regen_weight: number;
  active: boolean;
}

export interface Series {
  id: string;
  name: string;
  short_name: string;
  tier: number; // 1 = Topo, 2 = Acesso, 3 = Intermediário, 4 = Base
  description: string | null;
  order_index: number;
  active: boolean;
}

export interface BaseTeam {
  id: string;
  name: string;
  country_id: string;
  primary_color: string;
  secondary_color: string;
  starting_series_id: string;
  created_at?: string;
}

export interface BaseDriver {
  id: string;
  first_name: string;
  last_name: string;
  nationality_country_id: string | null;
  birth_date: string | null; // YYYY-MM-DD quando conhecido
  starting_overall: number;
  potential: number;
  starting_series_id: string;
  starting_team_id: string | null;
  racing_number: number | null;
  active: boolean;
  created_at?: string;
}

export interface RegenNamePool {
  id: string;
  country_id: string;
  type: 'first_name' | 'last_name';
  value: string;
  weight: number;
  created_at?: string;
}

export interface GameWorld {
  id: string;
  user_id: string;
  name: string;
  start_year: number;
  current_year: number;
  current_season_id: string | null;
  seed: string;
  status: WorldStatus;
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: string;
  world_id: string;
  year: number;
  series_id: string;
  status: SeasonStatus;
  current_round: number;
  created_at: string;
}

export type RoundStatus = 'scheduled' | 'completed';

export interface SeasonRound {
  id: string;
  world_id: string;
  season_id: string;
  round_number: number;
  name: string;
  circuit_name: string;
  country_id: string;
  event_date: string;
  status: RoundStatus;
  created_at: string;
}

export interface WorldTeam {
  id: string;
  world_id: string;
  base_team_id: string | null;
  origin: TeamOrigin;
  name: string;
  country_id: string;
  primary_color: string;
  secondary_color: string;
  current_series_id: string;
  performance: number;
  reliability: number;
  budget: number;
  facilities: number;
  development: number;
  prestige: number;
  academy_quality: number;
  active: boolean;
  founded_year: number;
  closed_year: number | null;
  created_at: string;
}

export interface WorldDriver {
  id: string;
  world_id: string;
  base_driver_id: string | null;
  origin: DriverOrigin;
  first_name: string;
  last_name: string;
  nationality_country_id: string | null;
  birth_date: string | null;

  // Ratings
  overall: number;
  potential: number;

  // Atributos de Pilotagem
  qualifying: number;
  racecraft: number;
  consistency: number;
  wet_skill: number;
  aggression: number;
  tyre_management: number;
  starts: number;
  defending: number;
  overtaking: number;
  adaptability: number;
  experience: number;
  confidence: number;

  racing_number: number | null;

  // Equipe & Categoria
  current_team_id: string | null;
  current_series_id: string | null;

  // Reputação
  reputation: number;
  fame: number;

  // Carreira
  career_status: DriverStatus;
  debut_year: number;
  retirement_year: number | null;
  generated_seed: string | null;

  created_at: string;
  updated_at: string;
}

export interface PlayerCareer {
  id: string;
  user_id: string;
  world_id: string;
  driver_id: string;
  racing_number: number;
  driving_style: DrivingStyle;
  difficulty: string;
  career_started_at: string;
  career_completed_at: string | null;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface Contract {
  id: string;
  world_id: string;
  driver_id: string;
  team_id: string;
  series_id: string;
  start_season_year: number;
  end_season_year: number;
  salary_per_year: number;
  role: ContractRole;
  status: 'active' | 'expired' | 'terminated';
  created_at: string;
}

export interface ChampionshipEntry {
  id: string;
  world_id: string;
  season_id: string;
  team_id: string;
  driver_id: string;
  car_number: number;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
  created_at: string;
}

export interface Race {
  id: string;
  world_id: string;
  season_id: string;
  round_id: string;
  round_number: number;
  name: string;
  circuit_name: string;
  country_id: string;
  laps: number;
  race_number: number;
  race_format: 'long' | 'short';
  status: 'scheduled' | 'in_progress' | 'finished';
  created_at: string;
}

export interface RaceResult {
  id: string;
  world_id: string;
  race_id: string;
  driver_id: string;
  team_id: string;
  grid_position: number;
  finish_position: number | null;
  points_awarded: number;
  fastest_lap: boolean;
  dnf_reason: string | null;
  created_at: string;
}

export interface CareerEvent {
  id: string;
  world_id: string;
  player_career_id: string;
  season_year: number;
  event_type: string;
  title: string;
  description: string;
  impact_data: Record<string, unknown>;
  created_at: string;
}

export interface HistoricEvent {
  id: string;
  world_id: string;
  season_year: number;
  event_type: string;
  headline: string;
  summary: string;
  created_at: string;
}

/**
 * Interface com dados agregados para visualização do Piloto
 */
export interface EnrichedWorldDriver extends WorldDriver {
  country?: Country;
  team?: WorldTeam;
  series?: Series;
  age: number;
}
