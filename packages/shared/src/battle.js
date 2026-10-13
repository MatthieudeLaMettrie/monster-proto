import { getTypeMultiplier } from './typeChart.js';
export class DefaultRng {
    random() {
        return Math.random();
    }
    range(min, max) {
        return min + this.random() * (max - min);
    }
}
// Pseudo-random seeded RNG (for deterministic battle simulation)
export class SeededRng {
    state;
    constructor(seed) {
        this.state = seed % 2147483647;
        if (this.state <= 0)
            this.state += 2147483646;
    }
    random() {
        this.state = (this.state * 16807) % 2147483647;
        return (this.state - 1) / 2147483646;
    }
    range(min, max) {
        return min + this.random() * (max - min);
    }
}
// Pure damage formula:
// damage = floor(((2*L/5 + 2) * power * atk/def) / 50 + 2)
//          * (moveType === userType ? 1.5 : 1)
//          * typeChart[moveType][defType]
//          * (attackerStatus?.condition === 'burn' ? 0.75 : 1)
//          * rng.range(0.85, 1.0)
export function calculateDamage(ctx, rng = new DefaultRng()) {
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
export function canAct(status, rng = new DefaultRng()) {
    if (!status)
        return { canAct: true };
    if (status.condition === 'sleep') {
        const turns = status.sleepTurnsLeft ?? 2;
        if (turns > 1) {
            return {
                canAct: false,
                reason: 'is fast asleep!',
                statusUpdate: { condition: 'sleep', sleepTurnsLeft: turns - 1 }
            };
        }
        else {
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
        }
        else {
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
export function calculateStatusResidual(status, maxHp) {
    if (!status)
        return { damage: 0 };
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
export function rollStatusProc(move, defenderStatus, rng = new DefaultRng()) {
    if (defenderStatus)
        return null; // already has a status condition
    if (!move.statusEffect)
        return null;
    if (rng.random() < move.statusEffect.chance) {
        if (move.statusEffect.condition === 'sleep') {
            const turns = Math.floor(rng.range(1, 4)); // 1 to 3 turns
            return { condition: 'sleep', sleepTurnsLeft: turns };
        }
        return { condition: move.statusEffect.condition };
    }
    return null;
}
