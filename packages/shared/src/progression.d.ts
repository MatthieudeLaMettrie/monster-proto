import { ElementType, MonsterSpecies } from './types.js';
export declare function calculateStat(base: number, level: number): number;
export declare function calculateMaxHp(baseHp: number, level: number): number;
export declare function totalXpForLevel(level: number, type: ElementType): number;
export declare function calculateXpReward(baseXp: number, enemyLevel: number): number;
export declare function calculateCatchChance(stage: 1 | 2 | 3, currentHp: number, maxHp: number, hasStatus?: boolean): number;
export declare function getDefaultMoves(species: MonsterSpecies, level: number): string[];
