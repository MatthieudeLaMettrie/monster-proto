import { MonsterSpecies } from './types.js';
export declare const SPECIES: MonsterSpecies[];
export declare const SPECIES_BY_ID: Map<number, MonsterSpecies>;
export declare function getSpecies(id: number): MonsterSpecies;
