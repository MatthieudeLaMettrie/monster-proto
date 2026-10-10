import { ElementType } from './types.js';
import { MoveDefinition } from './moves.js';
export interface RngInterface {
    random(): number;
    range(min: number, max: number): number;
}
export declare class DefaultRng implements RngInterface {
    random(): number;
    range(min: number, max: number): number;
}
export declare class SeededRng implements RngInterface {
    private state;
    constructor(seed: number);
    random(): number;
    range(min: number, max: number): number;
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
export declare function calculateDamage(ctx: DamageContext, rng?: RngInterface): DamageResult;
