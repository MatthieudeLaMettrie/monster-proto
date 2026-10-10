import { ElementType } from './types.js';
export declare const TYPE_CHART: Record<ElementType, Partial<Record<ElementType, number>>>;
export declare function getTypeMultiplier(attackerType: ElementType | 'Normal', defenderType: ElementType): number;
