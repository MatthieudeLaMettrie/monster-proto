import { ElementType } from './types.js';
export interface EncounterZone {
    id: string;
    name: string;
    minLevel: number;
    maxLevel: number;
    types: ElementType[];
    speciesIds: number[];
}
export declare const MAP_ZONES: Record<string, EncounterZone>;
