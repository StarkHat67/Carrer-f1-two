import { SeededRandom } from '../random/seed';
import { DrivingStyle, WorldDriver, RegenNamePool } from '../../types/database';

export interface CreatePlayerDriverInput {
  worldId: string;
  firstName?: string;
  lastName: string;
  countryId: string;
  racingNumber: number;
  drivingStyle: DrivingStyle;
  teamId: string;
  seriesId: string;
  seedGenerator: SeededRandom;
}

/**
 * Gera atributos iniciais equilibrados para o piloto do jogador aos 16 anos (~50 OVR)
 * com pequenas variações determinísticas baseadas no estilo escolhido e na seed.
 */
export function generatePlayerInitialAttributes(
  style: DrivingStyle,
  rng: SeededRandom
): Omit<WorldDriver, 'id' | 'world_id' | 'created_at' | 'updated_at'> {
  // Variações aleatórias pequenas por atributo (-3 a +4)
  const jitter = (factor = 1) => Math.round(rng.nextInt(-3, 4) * factor);

  // Perfil base de 16 anos na base (F4)
  let baseOverall = 50 + rng.nextInt(-1, 2);
  let potential = rng.nextInt(82, 94); // Alto teto de desenvolvimento

  let qualifying = 49 + jitter();
  let racecraft = 51 + jitter();
  let consistency = 48 + jitter();
  let wet_skill = 50 + jitter();
  let aggression = 50 + jitter();
  let tyre_management = 48 + jitter();
  let starts = 50 + jitter();
  let defending = 49 + jitter();
  let overtaking = 51 + jitter();
  let adaptability = 52 + jitter();
  let experience = 16 + rng.nextInt(0, 4); // Jovem kartista
  let confidence = 55 + jitter();

  // Moduladores por Estilo de Pilotagem
  switch (style) {
    case 'Agressivo':
      aggression += 7;
      overtaking += 6;
      starts += 5;
      tyre_management -= 4;
      consistency -= 3;
      break;

    case 'Técnico':
      qualifying += 6;
      adaptability += 6;
      wet_skill += 4;
      defending += 3;
      aggression -= 2;
      break;

    case 'Consistente':
      consistency += 7;
      tyre_management += 6;
      defending += 5;
      aggression -= 4;
      qualifying -= 2;
      break;

    case 'Calculista':
      tyre_management += 7;
      racecraft += 5;
      defending += 5;
      adaptability += 4;
      aggression -= 6;
      break;

    case 'Instintivo':
      starts += 6;
      racecraft += 6;
      wet_skill += 5;
      confidence += 5;
      consistency -= 4;
      break;
  }

  // Trava os valores entre limites seguros
  const clamp = (val: number, min = 20, max = 99) => Math.max(min, Math.min(max, val));

  qualifying = clamp(qualifying);
  racecraft = clamp(racecraft);
  consistency = clamp(consistency);
  wet_skill = clamp(wet_skill);
  aggression = clamp(aggression);
  tyre_management = clamp(tyre_management);
  starts = clamp(starts);
  defending = clamp(defending);
  overtaking = clamp(overtaking);
  adaptability = clamp(adaptability);
  experience = clamp(experience);
  confidence = clamp(confidence);

  // Calcula OVR ponderado
  const computedOvr = Math.round(
    (qualifying * 0.18) +
    (racecraft * 0.20) +
    (consistency * 0.14) +
    (tyre_management * 0.14) +
    (overtaking * 0.12) +
    (starts * 0.08) +
    (wet_skill * 0.08) +
    (adaptability * 0.06)
  );

  baseOverall = clamp(computedOvr, 45, 56);

  // Data de nascimento calculada para ter ~16 anos em 2026
  const birthYear = 2026 - 16;
  const birthMonth = String(rng.nextInt(1, 12)).padStart(2, '0');
  const birthDay = String(rng.nextInt(1, 28)).padStart(2, '0');
  const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;

  return {
    base_driver_id: null,
    origin: 'player',
    first_name: '',
    last_name: '',
    nationality_country_id: 'BRA',
    birth_date: birthDate,
    overall: baseOverall,
    potential: clamp(potential, 80, 96),
    qualifying,
    racecraft,
    consistency,
    wet_skill,
    aggression,
    tyre_management,
    starts,
    defending,
    overtaking,
    adaptability,
    experience,
    confidence,
    racing_number: null,
    current_team_id: null,
    current_series_id: 'f4_brazil',
    reputation: 25,
    fame: 10,
    career_status: 'active',
    debut_year: 2026,
    retirement_year: null,
    generated_seed: rng.getSeed(),
  };
}

/**
 * Função utilitária demonstrativa para geração de nomes de Regens
 * utilizando pools de nomes e seeds determinísticas (Req. 11)
 */
export function generateRegenNamePreview(
  countryId: string,
  pools: RegenNamePool[],
  rng: SeededRandom
): { firstName: string; lastName: string } {
  const firstNames = pools.filter(p => p.country_id === countryId && p.type === 'first_name');
  const lastNames = pools.filter(p => p.country_id === countryId && p.type === 'last_name');

  const firstName = firstNames.length > 0
    ? rng.weightedPick(firstNames.map(f => ({ item: f.value, weight: f.weight })))
    : 'Alex';

  const lastName = lastNames.length > 0
    ? rng.weightedPick(lastNames.map(l => ({ item: l.value, weight: l.weight })))
    : 'Rider';

  return { firstName, lastName };
}
