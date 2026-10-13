import { z } from 'zod';
export declare const ClientLobbyMessageSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"move">;
    x: z.ZodNumber;
    y: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "move";
    x: number;
    y: number;
}, {
    type: "move";
    x: number;
    y: number;
}>, z.ZodObject<{
    type: z.ZodLiteral<"challenge">;
    targetPlayerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "challenge";
    targetPlayerId: string;
}, {
    type: "challenge";
    targetPlayerId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"respond_challenge">;
    fromPlayerId: z.ZodString;
    accepted: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "respond_challenge";
    fromPlayerId: string;
    accepted: boolean;
}, {
    type: "respond_challenge";
    fromPlayerId: string;
    accepted: boolean;
}>, z.ZodObject<{
    type: z.ZodLiteral<"quick_match">;
}, "strip", z.ZodTypeAny, {
    type: "quick_match";
}, {
    type: "quick_match";
}>]>;
export type ClientLobbyMessage = z.infer<typeof ClientLobbyMessageSchema>;
export interface PlayerPresence {
    id: string;
    name: string;
    avatar: number;
    x: number;
    y: number;
}
export type ServerLobbyMessage = {
    type: 'presence_snapshot';
    players: PlayerPresence[];
} | {
    type: 'player_joined';
    player: PlayerPresence;
} | {
    type: 'player_moved';
    id: string;
    x: number;
    y: number;
} | {
    type: 'player_left';
    id: string;
} | {
    type: 'challenged';
    fromPlayerId: string;
    fromPlayerName: string;
} | {
    type: 'challenge_declined';
    fromPlayerName: string;
} | {
    type: 'match_start';
    battleId: string;
    opponentName: string;
};
export declare const ClientBattleMessageSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"pick_team">;
    monsters: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        speciesId: z.ZodNumber;
        nickname: z.ZodString;
        level: z.ZodNumber;
        xp: z.ZodNumber;
        currentHp: z.ZodNumber;
        maxHp: z.ZodNumber;
        moves: z.ZodArray<z.ZodString, "many">;
        movePp: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        status: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            condition: z.ZodEnum<["burn", "poison", "paralysis", "sleep", "freeze"]>;
            sleepTurnsLeft: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            condition: "burn" | "poison" | "paralysis" | "sleep" | "freeze";
            sleepTurnsLeft?: number | undefined;
        }, {
            condition: "burn" | "poison" | "paralysis" | "sleep" | "freeze";
            sleepTurnsLeft?: number | undefined;
        }>>>;
        partySlot: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        speciesId: number;
        nickname: string;
        level: number;
        xp: number;
        currentHp: number;
        maxHp: number;
        moves: string[];
        status?: {
            condition: "burn" | "poison" | "paralysis" | "sleep" | "freeze";
            sleepTurnsLeft?: number | undefined;
        } | null | undefined;
        movePp?: Record<string, number> | undefined;
        partySlot?: number | null | undefined;
    }, {
        id: string;
        speciesId: number;
        nickname: string;
        level: number;
        xp: number;
        currentHp: number;
        maxHp: number;
        moves: string[];
        status?: {
            condition: "burn" | "poison" | "paralysis" | "sleep" | "freeze";
            sleepTurnsLeft?: number | undefined;
        } | null | undefined;
        movePp?: Record<string, number> | undefined;
        partySlot?: number | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "pick_team";
    monsters: {
        id: string;
        speciesId: number;
        nickname: string;
        level: number;
        xp: number;
        currentHp: number;
        maxHp: number;
        moves: string[];
        status?: {
            condition: "burn" | "poison" | "paralysis" | "sleep" | "freeze";
            sleepTurnsLeft?: number | undefined;
        } | null | undefined;
        movePp?: Record<string, number> | undefined;
        partySlot?: number | null | undefined;
    }[];
}, {
    type: "pick_team";
    monsters: {
        id: string;
        speciesId: number;
        nickname: string;
        level: number;
        xp: number;
        currentHp: number;
        maxHp: number;
        moves: string[];
        status?: {
            condition: "burn" | "poison" | "paralysis" | "sleep" | "freeze";
            sleepTurnsLeft?: number | undefined;
        } | null | undefined;
        movePp?: Record<string, number> | undefined;
        partySlot?: number | null | undefined;
    }[];
}>, z.ZodObject<{
    type: z.ZodLiteral<"action">;
    actionType: z.ZodEnum<["move", "forfeit"]>;
    moveId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "action";
    actionType: "move" | "forfeit";
    moveId?: string | undefined;
}, {
    type: "action";
    actionType: "move" | "forfeit";
    moveId?: string | undefined;
}>]>;
export type ClientBattleMessage = z.infer<typeof ClientBattleMessageSchema>;
export type ServerBattleMessage = {
    type: 'waiting_for_opponent';
} | {
    type: 'battle_ready';
    yourTeam: any[];
    opponentTeam: any[];
    opponentName: string;
} | {
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
} | {
    type: 'battle_over';
    winnerId: string;
    reason: string;
};
