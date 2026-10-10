import { ElementType } from './types.js';
import { getTypeMultiplier } from './typeChart.js';
import { MOVES, MoveDefinition } from './moves.js';

export interface RngInterface {
  random(): number; // 0 <= n < 1
  range(min: number, max: number): number;
}

export class DefaultRng implements RngInterface {
  random(): number {
    return Math.random();
  }
  range(min: number, max: number): number {
    return min + this.random() * (max - min);
  }
}

// Pseudo-random seeded RNG (for deterministic battle simulation)
export class SeededRng implements RngInterface {
  private state: number;

  constructor(seed: number) {
    this.state = seed % 2147483647;
    if (this.state <= 0) this.state += 2147483646;
  }

  random(): number {
    this.state = (this.state * 16807) % 2147483647;
    return (this.state - 1) / 2147483646;
  }

  range(min: number, max: number): number {
    return min + this.random() * (max - min);
  }
}

export interface DamageContext {
  attackerLevel: number;
  attackerAtk: number;
  attackerType: ElementType;
  defenderDef: number;
  defenderType: ElementType;
  move: MoveDefinition;
}

export interface DamageResult {
  damage: number;
  typeMultiplier: number;
  isCritical: boolean;
  isStab: boolean;
  hit: boolean;
}

// Pure damage formula:
// damage = floor(((2*L/5 + 2) * power * atk/def) / 50 + 2)
//          * (moveType === userType ? 1.5 : 1)
//          * typeChart[moveType][defType]
//          * rng.range(0.85, 1.0)
export function calculateDamage(ctx: DamageContext, rng: RngInterface = new DefaultRng()): DamageResult {
  const { attackerLevel, attackerAtk, attackerType, defenderDef, defenderType, move } = ctx;

  // Accuracy roll
  if (rng.random() > move.accuracy) {
    return {
      damage: 0,
      typeMultiplier: 1.0,
      isCritical: false,
      isStab: false,
      hit: false
    };
  }

  const basePower = move.power;
  const levelFactor = (2 * attackerLevel) / 5 + 2;
  const statRatio = attackerAtk / Math.max(1, defenderDef);
  const baseDmg = Math.floor((levelFactor * basePower * statRatio) / 50 + 2);

  const isStab = move.type === attackerType;
  const stabMultiplier = isStab ? 1.5 : 1.0;

  const typeMultiplier = getTypeMultiplier(move.type, defenderType);
  const randomVariance = rng.range(0.85, 1.0);

  const finalDamage = Math.max(1, Math.floor(baseDmg * stabMultiplier * typeMultiplier * randomVariance));

  return {
    damage: finalDamage,
    typeMultiplier,
    isCritical: false,
    isStab,
    hit: true
  };
}
