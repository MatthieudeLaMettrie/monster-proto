import { z } from 'zod';
import { ELEMENT_TYPES } from './types.js';

export const SaveMonsterSchema = z.object({
  id: z.string(),
  speciesId: z.number().int().min(1).max(60),
  nickname: z.string().max(20),
  level: z.number().int().min(1).max(50),
  xp: z.number().int().min(0),
  currentHp: z.number().int().min(0),
  maxHp: z.number().int().min(1),
  moves: z.array(z.string()).min(1).max(4),
  movePp: z.record(z.string(), z.number().int().min(0)).optional(),
  status: z.object({
    condition: z.enum(['burn', 'poison', 'paralysis', 'sleep', 'freeze']),
    sleepTurnsLeft: z.number().int().min(0).optional()
  }).nullable().optional(),
  partySlot: z.number().int().min(0).max(5).nullable().optional(),
  boxNumber: z.number().int().min(1).max(3).nullable().optional(),
  boxSlot: z.number().int().min(0).max(29).nullable().optional()
});

export const SaveStateSchema = z.object({
  posX: z.number().int().min(0).max(100),
  posY: z.number().int().min(0).max(100),
  championBeaten: z.number().int().min(0).max(1),
  party: z.array(SaveMonsterSchema).max(6),
  box: z.array(SaveMonsterSchema).max(90),
  dex: z.record(z.string(), z.boolean()), // speciesId -> caught
  badges: z.record(z.string(), z.boolean()).optional(),
  waypoints: z.array(z.string()).optional()
});

export type SaveStatePayload = z.infer<typeof SaveStateSchema>;
