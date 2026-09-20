import { SeasonRound, WorldDriver, WorldTeam } from '../../types/database';
import { createSeededRandom } from '../random/seed';

export interface SimulatedResult {
  driver_id: string;
  team_id: string;
  grid_position: number;
  finish_position: number | null;
  points_awarded: number;
  fastest_lap: boolean;
  dnf_reason: string | null;
}

export interface SimulatedRace {
  race_number: 1 | 2 | 3;
  race_format: 'long' | 'short';
  results: SimulatedResult[];
}

export interface WeekendSimulation {
  pole_driver_id: string;
  races: SimulatedRace[];
}

const LONG_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const SHORT_POINTS = [15, 12, 10, 8, 6, 4, 2, 1];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function teamById(teams: WorldTeam[]) {
  return new Map(teams.map((team) => [team.id, team]));
}

function qualifyingOrder(
  seed: string,
  round: SeasonRound,
  drivers: WorldDriver[],
  teams: WorldTeam[]
): WorldDriver[] {
  const map = teamById(teams);
  return drivers
    .map((driver) => {
      const team = driver.current_team_id ? map.get(driver.current_team_id) : undefined;
      const rng = createSeededRandom(`${seed}:round:${round.round_number}:quali:${driver.id}`);
      const score =
        driver.qualifying * 0.48 +
        driver.consistency * 0.12 +
        driver.confidence * 0.10 +
        (team?.performance ?? 45) * 0.20 +
        driver.adaptability * 0.10 +
        rng.nextFloat(-8, 8);
      return { driver, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.driver);
}

function simulateRace(
  seed: string,
  round: SeasonRound,
  raceNumber: 1 | 2 | 3,
  format: 'long' | 'short',
  grid: WorldDriver[],
  teams: WorldTeam[]
): SimulatedRace {
  const map = teamById(teams);
  const total = grid.length;
  const scored = grid.map((driver, index) => {
    const team = driver.current_team_id ? map.get(driver.current_team_id) : undefined;
    const rng = createSeededRandom(`${seed}:round:${round.round_number}:race:${raceNumber}:${driver.id}`);
    const reliability = team?.reliability ?? 70;
    const dnfChance = clamp(0.025 + (100 - reliability) * 0.0012 + Math.max(0, driver.aggression - 72) * 0.0008, 0.02, 0.16);
    const dnf = rng.next() < dnfChance;
    const gridEffect = (total - index) * 0.7;
    const score =
      driver.racecraft * 0.26 +
      driver.overtaking * 0.11 +
      driver.defending * 0.07 +
      driver.consistency * 0.12 +
      driver.tyre_management * 0.10 +
      driver.starts * 0.08 +
      driver.confidence * 0.06 +
      (team?.performance ?? 45) * 0.15 +
      gridEffect +
      rng.nextFloat(-11, 11);
    return { driver, grid: index + 1, score, dnf, rng };
  });

  const finishers = scored.filter((x) => !x.dnf).sort((a, b) => b.score - a.score);
  const dnfs = scored.filter((x) => x.dnf).sort((a, b) => b.score - a.score);
  const order = [...finishers, ...dnfs];

  const fastestLapPool = finishers.slice(0, Math.min(8, finishers.length));
  let fastestLapDriverId: string | null = null;
  if (fastestLapPool.length) {
    fastestLapDriverId = fastestLapPool
      .map((x) => ({
        id: x.driver.id,
        score: x.driver.racecraft * 0.45 + x.driver.qualifying * 0.35 + (map.get(x.driver.current_team_id || '')?.performance ?? 45) * 0.20 + x.rng.nextFloat(-4, 4),
      }))
      .sort((a, b) => b.score - a.score)[0].id;
  }

  const pointsTable = format === 'long' ? LONG_POINTS : SHORT_POINTS;
  const results: SimulatedResult[] = order.map((entry, idx) => {
    const finish = entry.dnf ? null : idx + 1;
    const fastest = entry.driver.id === fastestLapDriverId;
    const basePoints = finish && finish <= pointsTable.length ? pointsTable[finish - 1] : 0;
    return {
      driver_id: entry.driver.id,
      team_id: entry.driver.current_team_id!,
      grid_position: entry.grid,
      finish_position: finish,
      points_awarded: basePoints + (fastest ? 1 : 0),
      fastest_lap: fastest,
      dnf_reason: entry.dnf ? (entry.rng.next() < 0.55 ? 'Problema mecânico' : 'Incidente') : null,
    };
  });

  return { race_number: raceNumber, race_format: format, results };
}

export function simulateF4Weekend(
  worldSeed: string,
  round: SeasonRound,
  drivers: WorldDriver[],
  teams: WorldTeam[]
): WeekendSimulation {
  const eligible = drivers.filter((d) => d.current_team_id && d.career_status === 'active');
  if (eligible.length < 2) throw new Error('Grid insuficiente para simular a etapa.');

  const quali = qualifyingOrder(worldSeed, round, eligible, teams);
  const race1 = simulateRace(worldSeed, round, 1, 'long', quali, teams);

  const race1Order = [...race1.results]
    .sort((a, b) => {
      if (a.finish_position == null) return 1;
      if (b.finish_position == null) return -1;
      return a.finish_position - b.finish_position;
    })
    .map((r) => eligible.find((d) => d.id === r.driver_id)!)
    .filter(Boolean);

  const top8 = race1Order.slice(0, 8).reverse();
  const race2Grid = [...top8, ...race1Order.slice(8)];
  const race2 = simulateRace(worldSeed, round, 2, 'short', race2Grid, teams);

  const race3 = simulateRace(worldSeed, round, 3, 'long', quali, teams);

  return {
    pole_driver_id: quali[0].id,
    races: [race1, race2, race3],
  };
}
