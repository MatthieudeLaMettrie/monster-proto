import { ElementType } from './types.js';
export interface MoveDefinition {
    id: string;
    name: string;
    type: ElementType | 'Normal';
    power: number;
    accuracy: number;
}
export declare const MOVES: Record<string, MoveDefinition>;
