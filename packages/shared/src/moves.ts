import { ElementType } from './types.js';

export interface MoveDefinition {
  id: string;
  name: string;
  type: ElementType | 'Normal';
  power: number;
  accuracy: number; // 0.0 to 1.0
}

export const MOVES: Record<string, MoveDefinition> = {
  // Base Neutral
  tackle: { id: 'tackle', name: 'Tackle', type: 'Normal', power: 40, accuracy: 1.0 },

  // Fire
  ember_nip: { id: 'ember_nip', name: 'Ember Nip', type: 'Fire', power: 40, accuracy: 1.0 },
  flame_lash: { id: 'flame_lash', name: 'Flame Lash', type: 'Fire', power: 65, accuracy: 0.95 },
  inferno: { id: 'inferno', name: 'Inferno', type: 'Fire', power: 90, accuracy: 0.85 },

  // Water
  splash_jet: { id: 'splash_jet', name: 'Splash Jet', type: 'Water', power: 40, accuracy: 1.0 },
  tide_crash: { id: 'tide_crash', name: 'Tide Crash', type: 'Water', power: 65, accuracy: 0.95 },
  hydro_surge: { id: 'hydro_surge', name: 'Hydro Surge', type: 'Water', power: 90, accuracy: 0.85 },

  // Grass
  leaf_dart: { id: 'leaf_dart', name: 'Leaf Dart', type: 'Grass', power: 40, accuracy: 1.0 },
  thorn_lash: { id: 'thorn_lash', name: 'Thorn Lash', type: 'Grass', power: 65, accuracy: 0.95 },
  solar_bloom: { id: 'solar_bloom', name: 'Solar Bloom', type: 'Grass', power: 90, accuracy: 0.85 },

  // Psy
  mind_poke: { id: 'mind_poke', name: 'Mind Poke', type: 'Psy', power: 40, accuracy: 1.0 },
  psy_wave: { id: 'psy_wave', name: 'Psy Wave', type: 'Psy', power: 65, accuracy: 0.95 },
  mind_crush: { id: 'mind_crush', name: 'Mind Crush', type: 'Psy', power: 90, accuracy: 0.85 },

  // Dark
  sneak_bite: { id: 'sneak_bite', name: 'Sneak Bite', type: 'Dark', power: 40, accuracy: 1.0 },
  shadow_claw: { id: 'shadow_claw', name: 'Shadow Claw', type: 'Dark', power: 65, accuracy: 0.95 },
  nightfall: { id: 'nightfall', name: 'Nightfall', type: 'Dark', power: 90, accuracy: 0.85 },

  // Dragon
  drake_breath: { id: 'drake_breath', name: 'Drake Breath', type: 'Dragon', power: 40, accuracy: 1.0 },
  scale_rush: { id: 'scale_rush', name: 'Scale Rush', type: 'Dragon', power: 65, accuracy: 0.95 },
  draco_fury: { id: 'draco_fury', name: 'Draco Fury', type: 'Dragon', power: 90, accuracy: 0.85 },

  // Fly
  gust_cut: { id: 'gust_cut', name: 'Gust Cut', type: 'Fly', power: 40, accuracy: 1.0 },
  wing_slice: { id: 'wing_slice', name: 'Wing Slice', type: 'Fly', power: 65, accuracy: 0.95 },
  sky_dive: { id: 'sky_dive', name: 'Sky Dive', type: 'Fly', power: 90, accuracy: 0.85 },

  // Fight
  jab: { id: 'jab', name: 'Jab', type: 'Fight', power: 40, accuracy: 1.0 },
  power_kick: { id: 'power_kick', name: 'Power Kick', type: 'Fight', power: 65, accuracy: 0.95 },
  final_blow: { id: 'final_blow', name: 'Final Blow', type: 'Fight', power: 90, accuracy: 0.85 }
};
