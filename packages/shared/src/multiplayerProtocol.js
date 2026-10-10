import { z } from 'zod';
import { SaveMonsterSchema } from './protocol.js';
// Client -> Server Lobby messages
export const ClientLobbyMessageSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('move'),
        x: z.number().int(),
        y: z.number().int()
    }),
    z.object({
        type: z.literal('challenge'),
        targetPlayerId: z.string()
    }),
    z.object({
        type: z.literal('respond_challenge'),
        fromPlayerId: z.string(),
        accepted: z.boolean()
    }),
    z.object({
        type: z.literal('quick_match')
    })
]);
// Client -> Server PvP Battle messages
export const ClientBattleMessageSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('pick_team'),
        monsters: z.array(SaveMonsterSchema).min(1).max(3)
    }),
    z.object({
        type: z.literal('action'),
        actionType: z.enum(['move', 'forfeit']),
        moveId: z.string().optional()
    })
]);
