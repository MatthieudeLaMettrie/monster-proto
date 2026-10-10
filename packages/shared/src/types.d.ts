export declare const ELEMENT_TYPES: readonly ["Fire", "Water", "Grass", "Psy", "Dark", "Dragon", "Fly", "Fight"];
export type ElementType = (typeof ELEMENT_TYPES)[number];
export interface MonsterSpecies {
    id: number;
    lineId: number;
    stage: 1 | 2 | 3;
    name: string;
    type: ElementType;
    bodyShape: 'quadruped' | 'shell' | 'fish' | 'blob' | 'biped' | 'winged' | 'orb' | 'serpent' | 'bird';
    baseStats: {
        hp: number;
        atk: number;
        def: number;
        spd: number;
    };
    evolvesTo?: number;
    evolvesAtLevel?: number;
    baseXp: number;
}
export interface Move {
    id: string;
    name: string;
    type: ElementType | 'Normal';
    power: number;
    accuracy: number;
}
export interface MonsterInstance {
    id: string;
    speciesId: number;
    nickname: string;
    level: number;
    xp: number;
    currentHp: number;
    maxHp: number;
    moves: string[];
    partySlot?: number | null;
}
