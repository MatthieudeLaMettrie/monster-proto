// 8 Elements / Monster Types
export const ELEMENT_TYPES = [
  'Fire',
  'Water',
  'Grass',
  'Psy',
  'Dark',
  'Dragon',
  'Fly',
  'Fight'
] as const;

export type ElementType = (typeof ELEMENT_TYPES)[number];

export interface MonsterSpecies {
  id: number;
  lineId: number; // 1 to 20
  stage: 1 | 2 | 3; // 1=base, 2=evo1, 3=evo2
  name: string;
  type: ElementType;
  bodyShape: 'quadruped' | 'shell' | 'fish' | 'blob' | 'biped' | 'winged' | 'orb' | 'serpent' | 'bird';
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spd: number;
  };
  evolvesTo?: number; // species id
  evolvesAtLevel?: number; // 7 for evo1, 15 for evo2
  baseXp: number;
}

export interface Move {
  id: string;
  name: string;
  type: ElementType | 'Normal';
  power: number;
  accuracy: number;
}

export type StatusCondition = 'burn' | 'poison' | 'paralysis' | 'sleep' | 'freeze';

export interface MonsterStatus {
  condition: StatusCondition;
  sleepTurnsLeft?: number;
}

export interface MonsterInstance {
  id: string;
  speciesId: number;
  nickname: string;
  level: number;
  xp: number;
  currentHp: number;
  maxHp: number;
  moves: string[]; // move ids
  movePp?: Record<string, number>; // moveId -> current PP
  status?: MonsterStatus | null; // active status condition
  partySlot?: number | null;
  boxNumber?: number | null;
  boxSlot?: number | null;
}
