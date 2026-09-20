import {
  GameWorld,
  WorldTeam,
  WorldDriver,
  PlayerCareer,
  Season,
  Contract,
  CareerEvent,
  HistoricEvent,
  DrivingStyle,
  BaseTeam,
  BaseDriver,
} from '../../types/database';
import { createSeededRandom, generateRandomSeed } from '../random/seed';
import { generatePlayerInitialAttributes } from '../drivers/generator';

export interface CreateNewCareerPayload {
  userId: string;
  saveName?: string;
  firstName?: string;
  lastName: string;
  countryId: string;
  racingNumber: number;
  drivingStyle: DrivingStyle;
}

export interface UniverseCreationResult {
  gameWorld: GameWorld;
  season: Season;
  worldTeams: WorldTeam[];
  worldDrivers: WorldDriver[];
  playerDriver: WorldDriver;
  playerCareer: PlayerCareer;
  contracts: Contract[];
  careerEvents: CareerEvent[];
  historicEvents: HistoricEvent[];
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Criação Atômica de um Universo Independente (Req. 16)
 * Nenhum dado é compartilhado entre saves.
 */
export function buildUniverseEntities(
  input: CreateNewCareerPayload,
  catalog: {
    baseTeams: BaseTeam[];
    baseDrivers: BaseDriver[];
  }
): UniverseCreationResult {
  const worldId = generateUUID();
  const seed = generateRandomSeed();

  const rootRng = createSeededRandom(seed);
  const now = new Date().toISOString();
  const startYear = 2026;

  // 1. Criar Temporada Inicial
  const seasonId = generateUUID();
  const season: Season = {
    id: seasonId,
    world_id: worldId,
    year: startYear,
    series_id: 'f4_brazil',
    status: 'in_progress',
    current_round: 1,
    created_at: now,
  };

  // 2. Criar Game World
  const gameWorld: GameWorld = {
    id: worldId,
    user_id: input.userId,
    name: input.saveName?.trim() || `Carreira de ${input.lastName}`,
    start_year: startYear,
    current_year: startYear,
    current_season_id: seasonId,
    seed,
    status: 'active',
    created_at: now,
    updated_at: now,
  };

  // 3. Mapear e Criar World Teams baseadas no catálogo base
  const teamIdMap = new Map<string, string>(); // base_team_id -> world_team_id
  const worldTeams: WorldTeam[] = catalog.baseTeams.map((bt) => {
    const worldTeamId = generateUUID();
    teamIdMap.set(bt.id, worldTeamId);

    const teamRng = rootRng.child(`team:${bt.id}`);
    const perfJitter = teamRng.nextInt(-3, 3);
    const relJitter = teamRng.nextInt(-3, 3);

    // Baseline stats por série
    let defaultPerf = 50;
    let defaultBudget = 5000000;
    let defaultPrestige = 50;

    if (bt.starting_series_id === 'f1') {
      defaultPerf = 85;
      defaultBudget = 140000000;
      defaultPrestige = 90;
    } else if (bt.starting_series_id === 'f2') {
      defaultPerf = 70;
      defaultBudget = 15000000;
      defaultPrestige = 70;
    } else if (bt.starting_series_id === 'f3') {
      defaultPerf = 60;
      defaultBudget = 8000000;
      defaultPrestige = 60;
    } else {
      defaultPerf = 48;
      defaultBudget = 3000000;
      defaultPrestige = 40;
    }

    return {
      id: worldTeamId,
      world_id: worldId,
      base_team_id: bt.id,
      origin: 'real',
      name: bt.name,
      country_id: bt.country_id,
      primary_color: bt.primary_color,
      secondary_color: bt.secondary_color,
      current_series_id: bt.starting_series_id,
      performance: Math.max(20, Math.min(99, defaultPerf + perfJitter)),
      reliability: Math.max(20, Math.min(99, 75 + relJitter)),
      budget: defaultBudget,
      facilities: Math.max(20, Math.min(99, defaultPrestige - 5 + teamRng.nextInt(-2, 2))),
      development: Math.max(20, Math.min(99, 60 + teamRng.nextInt(-5, 5))),
      prestige: defaultPrestige,
      academy_quality: Math.max(20, Math.min(99, 50 + teamRng.nextInt(-5, 5))),
      active: true,
      founded_year: startYear - teamRng.nextInt(5, 40),
      closed_year: null,
      created_at: now,
    };
  });

  // 4. Mapear e Criar World Drivers baseados no catálogo base
  const contracts: Contract[] = [];
  const worldDrivers: WorldDriver[] = catalog.baseDrivers.map((bd) => {
    const worldDriverId = generateUUID();
    const drvRng = rootRng.child(`driver:${bd.id}`);

    const mappedTeamId = bd.starting_team_id ? teamIdMap.get(bd.starting_team_id) || null : null;
    const ovr = bd.starting_overall;

    const driverStats: WorldDriver = {
      id: worldDriverId,
      world_id: worldId,
      base_driver_id: bd.id,
      origin: 'real',
      first_name: bd.first_name,
      last_name: bd.last_name,
      nationality_country_id: bd.nationality_country_id,
      birth_date: bd.birth_date,
      overall: ovr,
      potential: bd.potential,
      qualifying: Math.max(30, Math.min(99, ovr + drvRng.nextInt(-3, 3))),
      racecraft: Math.max(30, Math.min(99, ovr + drvRng.nextInt(-2, 4))),
      consistency: Math.max(30, Math.min(99, ovr + drvRng.nextInt(-4, 2))),
      wet_skill: Math.max(30, Math.min(99, ovr + drvRng.nextInt(-5, 5))),
      aggression: Math.max(30, Math.min(99, 50 + drvRng.nextInt(-15, 20))),
      tyre_management: Math.max(30, Math.min(99, ovr + drvRng.nextInt(-3, 3))),
      starts: Math.max(30, Math.min(99, ovr + drvRng.nextInt(-4, 4))),
      defending: Math.max(30, Math.min(99, ovr + drvRng.nextInt(-3, 3))),
      overtaking: Math.max(30, Math.min(99, ovr + drvRng.nextInt(-2, 4))),
      adaptability: Math.max(30, Math.min(99, 60 + drvRng.nextInt(-10, 15))),
      experience: Math.max(10, Math.min(99, Math.round(ovr * 0.9) + drvRng.nextInt(-5, 5))),
      confidence: Math.max(30, Math.min(99, 65 + drvRng.nextInt(-10, 15))),
      racing_number: bd.racing_number,
      current_team_id: mappedTeamId,
      current_series_id: bd.starting_series_id,
      reputation: Math.max(10, Math.min(99, Math.round(ovr * 0.95))),
      fame: Math.max(5, Math.min(99, Math.round(ovr * 0.85))),
      career_status: 'active',
      debut_year: bd.birth_date ? Math.min(2026, parseInt(bd.birth_date.slice(0, 4), 10) + 18) : 2026,
      retirement_year: null,
      generated_seed: null,
      created_at: now,
      updated_at: now,
    };

    if (mappedTeamId) {
      contracts.push({
        id: generateUUID(),
        world_id: worldId,
        driver_id: worldDriverId,
        team_id: mappedTeamId,
        series_id: bd.starting_series_id,
        start_season_year: startYear,
        end_season_year: startYear + 1,
        salary_per_year: Math.round(ovr * 15000),
        role: 'first_driver',
        status: 'active',
        created_at: now,
      });
    }

    return driverStats;
  });

  // 5. Determinar Equipe Inicial da Categoria Júnior F4 para o Jogador
  // Seleciona uma equipe da Fórmula 4 Brasil para o jogador
  const juniorTeams = worldTeams.filter(t => t.current_series_id === 'f4_brazil');
  const playerTeam = juniorTeams.find(t => t.country_id === input.countryId) || juniorTeams[0] || worldTeams[0];

  // 6. Criar World Driver do Jogador
  const playerDriverId = generateUUID();
  const playerRng = rootRng.child(`player:${playerDriverId}`);
  const playerBaseAttributes = generatePlayerInitialAttributes(input.drivingStyle, playerRng);

  const playerDriver: WorldDriver = {
    ...playerBaseAttributes,
    id: playerDriverId,
    world_id: worldId,
    first_name: input.firstName?.trim() || 'Piloto',
    last_name: input.lastName.trim(),
    nationality_country_id: input.countryId,
    racing_number: input.racingNumber,
    current_team_id: playerTeam.id,
    current_series_id: 'f4_brazil',
    created_at: now,
    updated_at: now,
  };

  worldDrivers.push(playerDriver);

  // 7. Criar Contrato Inicial do Jogador
  contracts.push({
    id: generateUUID(),
    world_id: worldId,
    driver_id: playerDriverId,
    team_id: playerTeam.id,
    series_id: 'f4_brazil',
    start_season_year: startYear,
    end_season_year: startYear,
    salary_per_year: 35000,
    role: 'first_driver',
    status: 'active',
    created_at: now,
  });

  // 8. Criar Player Career
  const playerCareerId = generateUUID();
  const playerCareer: PlayerCareer = {
    id: playerCareerId,
    user_id: input.userId,
    world_id: worldId,
    driver_id: playerDriverId,
    racing_number: input.racingNumber,
    driving_style: input.drivingStyle,
    difficulty: 'normal',
    career_started_at: now,
    career_completed_at: null,
    settings: {
      autoSave: true,
      simulationSpeed: 'fast',
    },
    created_at: now,
  };

  // 9. Eventos Iniciais da Carreira (Boas-vindas e primeiro contrato)
  const careerEvents: CareerEvent[] = [
    {
      id: generateUUID(),
      world_id: worldId,
      player_career_id: playerCareerId,
      season_year: startYear,
      event_type: 'debut',
      title: 'Início da Jornada nos Monopostos',
      description: `${playerDriver.first_name} ${playerDriver.last_name} assinou seu primeiro contrato profissional com a equipe ${playerTeam.name} na categoria Fórmula 4 Brasil para a temporada de ${startYear}.`,
      impact_data: {
        reputationBonus: 5,
      },
      created_at: now,
    },
  ];

  // 10. Registro Histórico da Fundação do Universo
  const historicEvents: HistoricEvent[] = [
    {
      id: generateUUID(),
      world_id: worldId,
      season_year: startYear,
      event_type: 'universe_initialized',
      headline: `Universo ${gameWorld.name} Inaugurado`,
      summary: `Temporada ${startYear} iniciada com ${worldDrivers.length} pilotos distribuídos entre F4 Brasil, F3, F2 e F1.`,
      created_at: now,
    },
  ];

  return {
    gameWorld,
    season,
    worldTeams,
    worldDrivers,
    playerDriver,
    playerCareer,
    contracts,
    careerEvents,
    historicEvents,
  };
}
