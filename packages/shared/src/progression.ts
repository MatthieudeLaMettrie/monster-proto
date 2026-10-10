import { ElementType, MonsterSpecies } from './types.js';
import { getSpecies } from './species.js';
import { MOVES } from './moves.js';

// Calculate stat at given level
// stat(base, L) = floor(base * 2 * L / 100) + 5
export function calculateStat(base: number, level: number): number {
  return Math.floor((base * 2 * level) / 100) + 5;
}

// Calculate max HP at given level
// hp(base, L) = floor(base * 2 * L / 100) + L + 10
export function calculateMaxHp(baseHp: number, level: number): number {
  return Math.floor((baseHp * 2 * level) / 100) + level + 10;
}

// XP required to reach level L
// xpToNext(L) = K * L * L (K = 6 for standard, 8 for Dragon)
export function totalXpForLevel(level: number, type: ElementType): number {
  const k = type === 'Dragon' ? 8 : 6;
  return Math.floor(k * level * level);
}

// XP granted upon defeating a wild or enemy monster
// xpGain = floor(enemyBaseXp * enemyLevel / 5)
export function calculateXpReward(baseXp: number, enemyLevel: number): number {
  return Math.max(1, Math.floor((baseXp * enemyLevel) / 5));
}

// Catch probability calculation
// stageCatch: stage 1 = 0.6, stage 2 = 0.3
// catchChance = clamp(stageCatch * (1 - 0.7 * currentHp / maxHp), 0.05, 0.95)
export function calculateCatchChance(stage: 1 | 2 | 3, currentHp: number, maxHp: number): number {
  const stageCatch = stage === 1 ? 0.6 : 0.3;
  const hpRatio = Math.max(0, Math.min(1, currentHp / maxHp));
  const chance = stageCatch * (1.0 - 0.7 * hpRatio);
  return Math.max(0.05, Math.min(0.95, chance));
}

// Get standard default moves for a species at a given level
export function getDefaultMoves(species: MonsterSpecies, level: number): string[] {
  const moves: string[] = ['tackle'];
  const typeMap: Record<ElementType, [string, string, string]> = {
    Fire: ['ember_nip', 'flame_lash', 'inferno'],
    Water: ['splash_jet', 'tide_crash', 'hydro_surge'],
    Grass: ['leaf_dart', 'thorn_lash', 'solar_bloom'],
    Psy: ['mind_poke', 'psy_wave', 'mind_crush'],
    Dark: ['sneak_bite', 'shadow_claw', 'nightfall'],
    Dragon: ['drake_breath', 'scale_rush', 'draco_fury'],
    Fly: ['gust_cut', 'wing_slice', 'sky_dive'],
    Fight: ['jab', 'power_kick', 'final_blow']
  };

  const [t1, t2, t3] = typeMap[species.type];
  moves.push(t1);

  if (species.stage >= 2 || level >= 7) {
    moves.push(t2);
  }
  if (species.stage === 3 || level >= 15) {
    moves.push(t3);
  }

  return moves.filter(id => MOVES[id] !== undefined);
}
