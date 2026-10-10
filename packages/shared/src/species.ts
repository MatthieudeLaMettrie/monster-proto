import { ElementType, MonsterSpecies } from './types.js';

// Base Stat Totals per evolutionary stage:
// Stage 1 (Base): 300
// Stage 2 (Evo 1): 405
// Stage 3 (Evo 2): 510

export const SPECIES: MonsterSpecies[] = [
  // --- Line 1: Fire Starter (ATK) ---
  {
    id: 1, lineId: 1, stage: 1, name: 'Emberpup', type: 'Fire', bodyShape: 'quadruped',
    baseStats: { hp: 55, atk: 75, def: 50, spd: 60 }, evolvesTo: 2, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 2, lineId: 1, stage: 2, name: 'Cindhound', type: 'Fire', bodyShape: 'quadruped',
    baseStats: { hp: 70, atk: 100, def: 65, spd: 80 }, evolvesTo: 3, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 3, lineId: 1, stage: 3, name: 'Infernmastiff', type: 'Fire', bodyShape: 'quadruped',
    baseStats: { hp: 90, atk: 130, def: 85, spd: 95 }, baseXp: 160
  },

  // --- Line 2: Fire (SPD / ATK) ---
  {
    id: 4, lineId: 2, stage: 1, name: 'Flickit', type: 'Fire', bodyShape: 'quadruped',
    baseStats: { hp: 45, atk: 70, def: 45, spd: 80 }, evolvesTo: 5, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 5, lineId: 2, stage: 2, name: 'Blazelynx', type: 'Fire', bodyShape: 'quadruped',
    baseStats: { hp: 60, atk: 95, def: 60, spd: 105 }, evolvesTo: 6, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 6, lineId: 2, stage: 3, name: 'Pyrolynx', type: 'Fire', bodyShape: 'quadruped',
    baseStats: { hp: 75, atk: 120, def: 75, spd: 130 }, baseXp: 160
  },

  // --- Line 3: Fire (DEF) ---
  {
    id: 7, lineId: 3, stage: 1, name: 'Coalbug', type: 'Fire', bodyShape: 'shell',
    baseStats: { hp: 60, atk: 50, def: 85, spd: 35 }, evolvesTo: 8, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 8, lineId: 3, stage: 2, name: 'Magmite', type: 'Fire', bodyShape: 'shell',
    baseStats: { hp: 80, atk: 65, def: 115, spd: 45 }, evolvesTo: 9, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 9, lineId: 3, stage: 3, name: 'Volcarapace', type: 'Fire', bodyShape: 'shell',
    baseStats: { hp: 100, atk: 85, def: 145, spd: 55 }, baseXp: 160
  },

  // --- Line 4: Water Starter (Balanced) ---
  {
    id: 10, lineId: 4, stage: 1, name: 'Puddlefin', type: 'Water', bodyShape: 'fish',
    baseStats: { hp: 65, atk: 60, def: 60, spd: 55 }, evolvesTo: 11, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 11, lineId: 4, stage: 2, name: 'Tidefin', type: 'Water', bodyShape: 'fish',
    baseStats: { hp: 85, atk: 80, def: 80, spd: 75 }, evolvesTo: 12, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 12, lineId: 4, stage: 3, name: 'Abyssfin', type: 'Water', bodyShape: 'fish',
    baseStats: { hp: 105, atk: 105, def: 100, spd: 90 }, baseXp: 160
  },

  // --- Line 5: Water (HP) ---
  {
    id: 13, lineId: 5, stage: 1, name: 'Bubblot', type: 'Water', bodyShape: 'blob',
    baseStats: { hp: 85, atk: 50, def: 55, spd: 40 }, evolvesTo: 14, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 14, lineId: 5, stage: 2, name: 'Brinetoad', type: 'Water', bodyShape: 'blob',
    baseStats: { hp: 115, atk: 65, def: 75, spd: 50 }, evolvesTo: 15, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 15, lineId: 5, stage: 3, name: 'Torrentoad', type: 'Water', bodyShape: 'blob',
    baseStats: { hp: 145, atk: 85, def: 95, spd: 65 }, baseXp: 160
  },

  // --- Line 6: Water (DEF) ---
  {
    id: 16, lineId: 6, stage: 1, name: 'Shellby', type: 'Water', bodyShape: 'shell',
    baseStats: { hp: 55, atk: 55, def: 85, spd: 35 }, evolvesTo: 17, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 17, lineId: 6, stage: 2, name: 'Coralisk', type: 'Water', bodyShape: 'shell',
    baseStats: { hp: 75, atk: 70, def: 115, spd: 45 }, evolvesTo: 18, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 18, lineId: 6, stage: 3, name: 'Leviashell', type: 'Water', bodyShape: 'shell',
    baseStats: { hp: 95, atk: 90, def: 145, spd: 60 }, baseXp: 160
  },

  // --- Line 7: Grass Starter (HP / DEF) ---
  {
    id: 19, lineId: 7, stage: 1, name: 'Sproutle', type: 'Grass', bodyShape: 'biped',
    baseStats: { hp: 70, atk: 55, def: 70, spd: 45 }, evolvesTo: 20, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 20, lineId: 7, stage: 2, name: 'Bramblet', type: 'Grass', bodyShape: 'biped',
    baseStats: { hp: 95, atk: 75, def: 95, spd: 60 }, evolvesTo: 21, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 21, lineId: 7, stage: 3, name: 'Thornwarden', type: 'Grass', bodyShape: 'biped',
    baseStats: { hp: 120, atk: 95, def: 125, spd: 70 }, baseXp: 160
  },

  // --- Line 8: Grass (ATK) ---
  {
    id: 22, lineId: 8, stage: 1, name: 'Mossling', type: 'Grass', bodyShape: 'quadruped',
    baseStats: { hp: 55, atk: 80, def: 55, spd: 50 }, evolvesTo: 23, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 23, lineId: 8, stage: 2, name: 'Fernbuck', type: 'Grass', bodyShape: 'quadruped',
    baseStats: { hp: 70, atk: 105, def: 75, spd: 65 }, evolvesTo: 24, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 24, lineId: 8, stage: 3, name: 'Elderstag', type: 'Grass', bodyShape: 'quadruped',
    baseStats: { hp: 90, atk: 135, def: 95, spd: 80 }, baseXp: 160
  },

  // --- Line 9: Grass (SPD) ---
  {
    id: 25, lineId: 9, stage: 1, name: 'Budbee', type: 'Grass', bodyShape: 'winged',
    baseStats: { hp: 45, atk: 65, def: 45, spd: 85 }, evolvesTo: 26, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 26, lineId: 9, stage: 2, name: 'Pollenwing', type: 'Grass', bodyShape: 'winged',
    baseStats: { hp: 60, atk: 85, def: 60, spd: 110 }, evolvesTo: 27, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 27, lineId: 9, stage: 3, name: 'Bloomqueen', type: 'Grass', bodyShape: 'winged',
    baseStats: { hp: 75, atk: 110, def: 75, spd: 135 }, baseXp: 160
  },

  // --- Line 10: Psy (ATK / SPD) ---
  {
    id: 28, lineId: 10, stage: 1, name: 'Glimmote', type: 'Psy', bodyShape: 'orb',
    baseStats: { hp: 45, atk: 80, def: 45, spd: 70 }, evolvesTo: 29, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 29, lineId: 10, stage: 2, name: 'Oracleye', type: 'Psy', bodyShape: 'orb',
    baseStats: { hp: 60, atk: 110, def: 60, spd: 95 }, evolvesTo: 30, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 30, lineId: 10, stage: 3, name: 'Omnisight', type: 'Psy', bodyShape: 'orb',
    baseStats: { hp: 75, atk: 140, def: 75, spd: 120 }, baseXp: 160
  },

  // --- Line 11: Psy (SPD) ---
  {
    id: 31, lineId: 11, stage: 1, name: 'Hushfox', type: 'Psy', bodyShape: 'quadruped',
    baseStats: { hp: 50, atk: 70, def: 50, spd: 80 }, evolvesTo: 32, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 32, lineId: 11, stage: 2, name: 'Dreamvix', type: 'Psy', bodyShape: 'quadruped',
    baseStats: { hp: 65, atk: 90, def: 65, spd: 110 }, evolvesTo: 33, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 33, lineId: 11, stage: 3, name: 'Astravix', type: 'Psy', bodyShape: 'quadruped',
    baseStats: { hp: 80, atk: 115, def: 85, spd: 135 }, baseXp: 160
  },

  // --- Line 12: Dark (SPD / ATK) ---
  {
    id: 34, lineId: 12, stage: 1, name: 'Gloomouse', type: 'Dark', bodyShape: 'quadruped',
    baseStats: { hp: 50, atk: 75, def: 50, spd: 75 }, evolvesTo: 35, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 35, lineId: 12, stage: 2, name: 'Nightnibble', type: 'Dark', bodyShape: 'quadruped',
    baseStats: { hp: 65, atk: 100, def: 65, spd: 100 }, evolvesTo: 36, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 36, lineId: 12, stage: 3, name: 'Umbrafang', type: 'Dark', bodyShape: 'quadruped',
    baseStats: { hp: 80, atk: 130, def: 80, spd: 125 }, baseXp: 160
  },

  // --- Line 13: Dark (Balanced) ---
  {
    id: 37, lineId: 13, stage: 1, name: 'Hexmoth', type: 'Dark', bodyShape: 'winged',
    baseStats: { hp: 60, atk: 65, def: 65, spd: 60 }, evolvesTo: 38, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 38, lineId: 13, stage: 2, name: 'Duskmoth', type: 'Dark', bodyShape: 'winged',
    baseStats: { hp: 80, atk: 85, def: 85, spd: 80 }, evolvesTo: 39, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 39, lineId: 13, stage: 3, name: 'Eclipsmoth', type: 'Dark', bodyShape: 'winged',
    baseStats: { hp: 100, atk: 110, def: 105, spd: 95 }, baseXp: 160
  },

  // --- Line 14: Dragon (ATK, slow curve) ---
  {
    id: 40, lineId: 14, stage: 1, name: 'Wyrmlet', type: 'Dragon', bodyShape: 'serpent',
    baseStats: { hp: 55, atk: 85, def: 60, spd: 55 }, evolvesTo: 41, evolvesAtLevel: 7, baseXp: 55
  },
  {
    id: 41, lineId: 14, stage: 2, name: 'Drakeling', type: 'Dragon', bodyShape: 'serpent',
    baseStats: { hp: 70, atk: 115, def: 80, spd: 75 }, evolvesTo: 42, evolvesAtLevel: 15, baseXp: 110
  },
  {
    id: 42, lineId: 14, stage: 3, name: 'Wyrmlord', type: 'Dragon', bodyShape: 'serpent',
    baseStats: { hp: 90, atk: 145, def: 100, spd: 95 }, baseXp: 175
  },

  // --- Line 15: Dragon (DEF, slow curve) ---
  {
    id: 43, lineId: 15, stage: 1, name: 'Scalekin', type: 'Dragon', bodyShape: 'biped',
    baseStats: { hp: 60, atk: 65, def: 85, spd: 45 }, evolvesTo: 44, evolvesAtLevel: 7, baseXp: 55
  },
  {
    id: 44, lineId: 15, stage: 2, name: 'Drakescale', type: 'Dragon', bodyShape: 'biped',
    baseStats: { hp: 80, atk: 85, def: 115, spd: 60 }, evolvesTo: 45, evolvesAtLevel: 15, baseXp: 110
  },
  {
    id: 45, lineId: 15, stage: 3, name: 'Aetherwyrm', type: 'Dragon', bodyShape: 'biped',
    baseStats: { hp: 105, atk: 105, def: 145, spd: 75 }, baseXp: 175
  },

  // --- Line 16: Fly (SPD) ---
  {
    id: 46, lineId: 16, stage: 1, name: 'Pipwing', type: 'Fly', bodyShape: 'bird',
    baseStats: { hp: 45, atk: 60, def: 45, spd: 90 }, evolvesTo: 47, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 47, lineId: 16, stage: 2, name: 'Galefinch', type: 'Fly', bodyShape: 'bird',
    baseStats: { hp: 60, atk: 80, def: 60, spd: 120 }, evolvesTo: 48, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 48, lineId: 16, stage: 3, name: 'Stormroc', type: 'Fly', bodyShape: 'bird',
    baseStats: { hp: 75, atk: 105, def: 80, spd: 145 }, baseXp: 160
  },

  // --- Line 17: Fly (SPD / ATK) ---
  {
    id: 49, lineId: 17, stage: 1, name: 'Flitbat', type: 'Fly', bodyShape: 'winged',
    baseStats: { hp: 45, atk: 75, def: 45, spd: 85 }, evolvesTo: 50, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 50, lineId: 17, stage: 2, name: 'Echowing', type: 'Fly', bodyShape: 'winged',
    baseStats: { hp: 60, atk: 100, def: 60, spd: 115 }, evolvesTo: 51, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 51, lineId: 17, stage: 3, name: 'Sonarch', type: 'Fly', bodyShape: 'winged',
    baseStats: { hp: 75, atk: 125, def: 75, spd: 140 }, baseXp: 160
  },

  // --- Line 18: Fly (HP) ---
  {
    id: 52, lineId: 18, stage: 1, name: 'Kiteling', type: 'Fly', bodyShape: 'fish',
    baseStats: { hp: 70, atk: 55, def: 55, spd: 65 }, evolvesTo: 53, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 53, lineId: 18, stage: 2, name: 'Skyray', type: 'Fly', bodyShape: 'fish',
    baseStats: { hp: 95, atk: 75, def: 75, spd: 85 }, evolvesTo: 54, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 54, lineId: 18, stage: 3, name: 'Cloudmanta', type: 'Fly', bodyShape: 'fish',
    baseStats: { hp: 125, atk: 95, def: 95, spd: 105 }, baseXp: 160
  },

  // --- Line 19: Fight (ATK / SPD) ---
  {
    id: 55, lineId: 19, stage: 1, name: 'Jabbit', type: 'Fight', bodyShape: 'biped',
    baseStats: { hp: 50, atk: 75, def: 50, spd: 75 }, evolvesTo: 56, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 56, lineId: 19, stage: 2, name: 'Boxhare', type: 'Fight', bodyShape: 'biped',
    baseStats: { hp: 65, atk: 105, def: 65, spd: 95 }, evolvesTo: 57, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 57, lineId: 19, stage: 3, name: 'Champhare', type: 'Fight', bodyShape: 'biped',
    baseStats: { hp: 80, atk: 135, def: 85, spd: 120 }, baseXp: 160
  },

  // --- Line 20: Fight (HP / ATK) ---
  {
    id: 58, lineId: 20, stage: 1, name: 'Cubrawl', type: 'Fight', bodyShape: 'biped',
    baseStats: { hp: 70, atk: 80, def: 55, spd: 45 }, evolvesTo: 59, evolvesAtLevel: 7, baseXp: 50
  },
  {
    id: 59, lineId: 20, stage: 2, name: 'Grizzlash', type: 'Fight', bodyShape: 'biped',
    baseStats: { hp: 95, atk: 110, def: 75, spd: 55 }, evolvesTo: 60, evolvesAtLevel: 15, baseXp: 100
  },
  {
    id: 60, lineId: 20, stage: 3, name: 'Ursumaul', type: 'Fight', bodyShape: 'biped',
    baseStats: { hp: 125, atk: 140, def: 95, spd: 65 }, baseXp: 160
  }
];

export const SPECIES_BY_ID = new Map<number, MonsterSpecies>(
  SPECIES.map(s => [s.id, s])
);

export function getSpecies(id: number): MonsterSpecies {
  const species = SPECIES_BY_ID.get(id);
  if (!species) throw new Error(`Species ID ${id} not found.`);
  return species;
}
