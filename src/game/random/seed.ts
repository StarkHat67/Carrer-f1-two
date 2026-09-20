/**
 * Motor Determinístico de Randomização por Seed
 * Motorsport Career Simulator
 * 
 * Garante que cada universo gere dados, atributos, regens e eventos
 * de forma 100% determinística e reproduzível, sem uso de Math.random() arbitrário.
 */

// Algoritmo de Hashing Murmur3 para transformar qualquer string em um uint32
function murmurHash3(key: string, seed = 0): number {
  let h = seed >>> 0;
  for (let i = 0; i < key.length; i++) {
    const k = key.charCodeAt(i);
    h = Math.imul(h ^ k, 0x5bd1e995);
    h ^= h >>> 15;
  }
  return h >>> 0;
}

export interface SeededRandom {
  /** Retorna número decimal entre 0 (inclusive) e 1 (exclusive) */
  next(): number;
  /** Retorna número inteiro entre min e max (ambos inclusivos) */
  nextInt(min: number, max: number): number;
  /** Retorna float entre min e max */
  nextFloat(min: number, max: number): number;
  /** Escolhe um elemento aleatório de uma lista */
  pick<T>(items: readonly T[]): T;
  /** Escolhe um elemento aleatório ponderado */
  weightedPick<T>(items: readonly { item: T; weight: number }[]): T;
  /** Cria um gerador derivado combinando a seed atual com sub-chaves */
  child(subKey: string | number): SeededRandom;
  /** Retorna a seed base atual */
  getSeed(): string;
}

/**
 * Cria um gerador determinístico Mulberry32 a partir de uma seed (string ou número)
 */
export function createSeededRandom(seed: string | number): SeededRandom {
  const seedString = String(seed);
  let state = murmurHash3(seedString, 0x1337);

  function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function nextInt(min: number, max: number): number {
    const l = Math.ceil(min);
    const u = Math.floor(max);
    return Math.floor(next() * (u - l + 1)) + l;
  }

  function nextFloat(min: number, max: number): number {
    return min + next() * (max - min);
  }

  function pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('Não é possível escolher de um array vazio');
    }
    const idx = Math.floor(next() * items.length);
    return items[idx];
  }

  function weightedPick<T>(items: readonly { item: T; weight: number }[]): T {
    if (items.length === 0) {
      throw new Error('Lista ponderada não pode ser vazia');
    }
    const totalWeight = items.reduce((sum, el) => sum + Math.max(1, el.weight), 0);
    let randomThreshold = next() * totalWeight;

    for (const entry of items) {
      const w = Math.max(1, entry.weight);
      if (randomThreshold <= w) {
        return entry.item;
      }
      randomThreshold -= w;
    }
    return items[items.length - 1].item;
  }

  function child(subKey: string | number): SeededRandom {
    return createSeededRandom(`${seedString}:${subKey}`);
  }

  return {
    next,
    nextInt,
    nextFloat,
    pick,
    weightedPick,
    child,
    getSeed: () => seedString,
  };
}

/**
 * Utilitário para gerar uma seed inicial aleatória para um novo save
 */
export function generateRandomSeed(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const prefix = 'WORLD';
  let body = '';
  const now = Date.now().toString(36).toUpperCase();
  for (let i = 0; i < 6; i++) {
    const randIdx = Math.floor((Math.sin(Date.now() + i) * 10000) % chars.length);
    const positiveIdx = Math.abs(randIdx) % chars.length;
    body += chars[positiveIdx];
  }
  return `${prefix}-${now.slice(-4)}-${body.slice(0, 4)}`;
}
