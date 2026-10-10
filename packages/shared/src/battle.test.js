import { describe, it, expect } from 'vitest';
import { SPECIES, MOVES, calculateStat, calculateMaxHp, calculateCatchChance, calculateDamage, SeededRng, calculateXpReward } from '../src/index.js';
describe('Species & Roster Integrity', () => {
    it('contains exactly 60 species across 20 lines with 3 stages each', () => {
        expect(SPECIES).toHaveLength(60);
        const lineMap = new Map();
        for (const s of SPECIES) {
            lineMap.set(s.lineId, (lineMap.get(s.lineId) ?? 0) + 1);
        }
        expect(lineMap.size).toBe(20);
        for (const [lineId, count] of lineMap.entries()) {
            expect(count, `Line ${lineId} should have exactly 3 evolutionary stages`).toBe(3);
        }
    });
    it('verifies evolution targets point to valid existing species', () => {
        for (const s of SPECIES) {
            if (s.stage < 3) {
                expect(s.evolvesTo).toBeDefined();
                const nextStage = SPECIES.find(target => target.id === s.evolvesTo);
                expect(nextStage).toBeDefined();
                expect(nextStage?.lineId).toBe(s.lineId);
                expect(nextStage?.stage).toBe(s.stage + 1);
            }
            else {
                expect(s.evolvesTo).toBeUndefined();
            }
        }
    });
});
describe('Progression & Formulas', () => {
    it('computes stats and HP predictably by level', () => {
        // Stat formula: floor(base * 2 * L / 100) + 5
        // base 100 at Lv 50: floor(100 * 100 / 100) + 5 = 105
        expect(calculateStat(100, 50)).toBe(105);
        // HP formula: floor(base * 2 * L / 100) + L + 10
        // base 100 at Lv 50: 100 + 50 + 10 = 160
        expect(calculateMaxHp(100, 50)).toBe(160);
    });
    it('clamps catch probability within safe bounds [0.05, 0.95]', () => {
        // Full HP base stage
        const fullHp = calculateCatchChance(1, 100, 100);
        expect(fullHp).toBeCloseTo(0.18, 2);
        // Low HP base stage
        const lowHp = calculateCatchChance(1, 5, 100);
        expect(lowHp).toBeGreaterThan(fullHp);
        expect(lowHp).toBeLessThanOrEqual(0.95);
    });
    it('computes XP rewards for defeating opponents', () => {
        const xp = calculateXpReward(50, 5);
        expect(xp).toBe(50);
    });
});
describe('Battle Engine Determinism', () => {
    it('produces identical damage and results given the same seeded RNG', () => {
        const fireMove = MOVES['ember_nip'];
        const ctx = {
            attackerLevel: 10,
            attackerAtk: 30,
            attackerType: 'Fire',
            defenderDef: 20,
            defenderType: 'Grass',
            move: fireMove
        };
        const res1 = calculateDamage(ctx, new SeededRng(42));
        const res2 = calculateDamage(ctx, new SeededRng(42));
        expect(res1.damage).toBe(res2.damage);
        expect(res1.hit).toBe(true);
        expect(res1.typeMultiplier).toBe(2.0);
        expect(res1.isStab).toBe(true);
    });
});
