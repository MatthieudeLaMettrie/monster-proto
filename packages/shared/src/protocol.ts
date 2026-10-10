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
  partySlot: z.number().int().min(0).max(5).nullable().optional()
});

export const SaveStateSchema = z.object({
  posX: z.number().int().min(0).max(50),
  posY: z.number().int().min(0).max(50),
  championBeaten: z.number().int().min(0).max(1),
  party: z.array(SaveMonsterSchema).max(6),
  box: z.array(SaveMonsterSchema).max(30),
  dex: z.record(z.string(), z.boolean()) // speciesId -> caught
});

export type SaveStatePayload = z.infer<typeof SaveStateSchema>;
