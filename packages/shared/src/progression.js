import { MOVES } from './moves.js';
// Calculate stat at given level
// stat(base, L) = floor(base * 2 * L / 100) + 5
export function calculateStat(base, level) {
    return Math.floor((base * 2 * level) / 100) + 5;
}
// Calculate max HP at given level
// hp(base, L) = floor(base * 2 * L / 100) + L + 10
export function calculateMaxHp(baseHp, level) {
    return Math.floor((baseHp * 2 * level) / 100) + level + 10;
}
// XP required to reach level L
// xpToNext(L) = K * L * L (K = 6 for standard, 8 for Dragon)
export function totalXpForLevel(level, type) {
    const k = type === 'Dragon' ? 8 : 6;
    return Math.floor(k * level * level);
}
// XP granted upon defeating a wild or enemy monster
// xpGain = floor(enemyBaseXp * enemyLevel / 5)
export function calculateXpReward(baseXp, enemyLevel) {
    return Math.max(1, Math.floor((baseXp * enemyLevel) / 5));
}
// Catch probability calculation
// stageCatch: stage 1 = 0.6, stage 2 = 0.3
// catchChance = clamp(stageCatch * (1 - 0.7 * currentHp / maxHp) * (hasStatus ? 1.5 : 1), 0.05, 0.95)
export function calculateCatchChance(stage, currentHp, maxHp, hasStatus = false) {
    const stageCatch = stage === 1 ? 0.6 : 0.3;
    const hpRatio = Math.max(0, Math.min(1, currentHp / maxHp));
    let chance = stageCatch * (1.0 - 0.7 * hpRatio);
    if (hasStatus) {
        chance *= 1.5;
    }
    return Math.max(0.05, Math.min(0.95, chance));
}
// Get standard default moves for a species at a given level
export function getDefaultMoves(species, level) {
    const moves = ['tackle'];
    const typeMap = {
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
