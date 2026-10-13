import { ElementType, MonsterStatus } from './types.js';
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
  attackerStatus?: MonsterStatus | null;
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
//          * (attackerStatus?.condition === 'burn' ? 0.75 : 1)
//          * rng.range(0.85, 1.0)
export function calculateDamage(ctx: DamageContext, rng: RngInterface = new DefaultRng()): DamageResult {
  const { attackerLevel, attackerAtk, attackerType, defenderDef, defenderType, move, attackerStatus } = ctx;

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

  // Burn reduces physical attack damage by 25%
  const burnMultiplier = attackerStatus?.condition === 'burn' ? 0.75 : 1.0;

  const typeMultiplier = getTypeMultiplier(move.type, defenderType);
  const randomVariance = rng.range(0.85, 1.0);

  const finalDamage = Math.max(1, Math.floor(baseDmg * stabMultiplier * typeMultiplier * burnMultiplier * randomVariance));

  return {
    damage: finalDamage,
    typeMultiplier,
    isCritical: false,
    isStab,
    hit: true
  };
}

export function canAct(
  status: MonsterStatus | null | undefined,
  rng: RngInterface = new DefaultRng()
): { canAct: boolean; reason?: string; statusUpdate?: MonsterStatus | null } {
  if (!status) return { canAct: true };

  if (status.condition === 'sleep') {
    const turns = status.sleepTurnsLeft ?? 2;
    if (turns > 1) {
      return {
        canAct: false,
        reason: 'is fast asleep!',
        statusUpdate: { condition: 'sleep', sleepTurnsLeft: turns - 1 }
      };
    } else {
      return {
        canAct: true,
        reason: 'woke up!',
        statusUpdate: null
      };
    }
  }

  if (status.condition === 'freeze') {
    // 20% chance to thaw
    if (rng.random() < 0.2) {
      return {
        canAct: true,
        reason: 'thawed out!',
        statusUpdate: null
      };
    } else {
      return {
        canAct: false,
        reason: 'is frozen solid!'
      };
    }
  }

  if (status.condition === 'paralysis') {
    // 25% chance of full paralysis
    if (rng.random() < 0.25) {
      return {
        canAct: false,
        reason: 'is fully paralyzed!'
      };
    }
    return { canAct: true };
  }

  return { canAct: true };
}

export function calculateStatusResidual(
  status: MonsterStatus | null | undefined,
  maxHp: number
): { damage: number; reason?: string } {
  if (!status) return { damage: 0 };

  if (status.condition === 'burn') {
    return {
      damage: Math.max(1, Math.floor(maxHp / 16)),
      reason: 'is hurt by its burn!'
    };
  }

  if (status.condition === 'poison') {
    return {
      damage: Math.max(1, Math.floor(maxHp / 16)),
      reason: 'is hurt by poison!'
    };
  }

  return { damage: 0 };
}

export function rollStatusProc(
  move: MoveDefinition,
  defenderStatus: MonsterStatus | null | undefined,
  rng: RngInterface = new DefaultRng()
): MonsterStatus | null {
  if (defenderStatus) return null; // already has a status condition
  if (!move.statusEffect) return null;

  if (rng.random() < move.statusEffect.chance) {
    if (move.statusEffect.condition === 'sleep') {
      const turns = Math.floor(rng.range(1, 4)); // 1 to 3 turns
      return { condition: 'sleep', sleepTurnsLeft: turns };
    }
    return { condition: move.statusEffect.condition };
  }

  return null;
}
