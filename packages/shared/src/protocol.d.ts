import { z } from 'zod';
export declare const SaveMonsterSchema: z.ZodObject<{
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
}>;
export declare const SaveStateSchema: z.ZodObject<{
    posX: z.ZodNumber;
    posY: z.ZodNumber;
    championBeaten: z.ZodNumber;
    party: z.ZodArray<z.ZodObject<{
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
    box: z.ZodArray<z.ZodObject<{
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
    dex: z.ZodRecord<z.ZodString, z.ZodBoolean>;
    badges: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    posX: number;
    posY: number;
    championBeaten: number;
    party: {
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
    box: {
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
    dex: Record<string, boolean>;
    badges?: Record<string, boolean> | undefined;
}, {
    posX: number;
    posY: number;
    championBeaten: number;
    party: {
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
    box: {
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
    dex: Record<string, boolean>;
    badges?: Record<string, boolean> | undefined;
}>;
export type SaveStatePayload = z.infer<typeof SaveStateSchema>;
