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

export type ClientLobbyMessage = z.infer<typeof ClientLobbyMessageSchema>;

// Server -> Client Lobby messages
export interface PlayerPresence {
  id: string;
  name: string;
  avatar: number;
  x: number;
  y: number;
}

export type ServerLobbyMessage =
  | { type: 'presence_snapshot'; players: PlayerPresence[] }
  | { type: 'player_joined'; player: PlayerPresence }
  | { type: 'player_moved'; id: string; x: number; y: number }
  | { type: 'player_left'; id: string }
  | { type: 'challenged'; fromPlayerId: string; fromPlayerName: string }
  | { type: 'challenge_declined'; fromPlayerName: string }
  | { type: 'match_start'; battleId: string; opponentName: string };

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

export type ClientBattleMessage = z.infer<typeof ClientBattleMessageSchema>;

// Server -> Client PvP Battle messages
export type ServerBattleMessage =
  | { type: 'waiting_for_opponent' }
  | {
      type: 'battle_ready';
      yourTeam: any[];
      opponentTeam: any[];
      opponentName: string;
    }
  | {
      type: 'turn_result';
      turnNumber: number;
      events: Array<{
        actorId: string;
        action: string;
        damage?: number;
        fainted?: boolean;
        message: string;
      }>;
      yourActiveHp: number;
      opponentActiveHp: number;
    }
  | {
      type: 'battle_over';
      winnerId: string;
      reason: string;
    };
