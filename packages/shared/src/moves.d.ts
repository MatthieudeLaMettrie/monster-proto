import { ElementType, StatusCondition } from './types.js';
export interface MoveStatusProc {
    condition: StatusCondition;
    chance: number;
}
export interface MoveDefinition {
    id: string;
    name: string;
    type: ElementType | 'Normal';
    power: number;
    accuracy: number;
    maxPp: number;
    statusEffect?: MoveStatusProc;
}
export declare const MOVES: Record<string, MoveDefinition>;
