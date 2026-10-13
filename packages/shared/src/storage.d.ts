import { MonsterInstance } from './types.js';
export declare const TOTAL_BOXES = 3;
export declare const BOX_CAPACITY = 30;
export declare const TOTAL_STORAGE_CAPACITY: number;
export interface BoxMetadata {
    boxNumber: number;
    name: string;
    themeColor: number;
    bgHex: string;
}
export declare const BOX_METADATA: BoxMetadata[];
export declare function getBoxMetadata(boxNumber: number): BoxMetadata;
/**
 * Finds the first available slot across storage boxes.
 * Prefers the provided box number, then searches sequentially 1..3.
 */
export declare function findFirstAvailableBoxSlot(boxMonsters: MonsterInstance[], preferredBox?: number): {
    boxNumber: number;
    boxSlot: number;
} | null;
/**
 * Validates whether a monster can be safely deposited into the PC.
 * A trainer cannot deposit their last monster or deposit their only conscious monster.
 */
export declare function canDepositMonster(party: MonsterInstance[], monsterId: string): {
    canDeposit: boolean;
    reason?: string;
};
/**
 * Validates whether a monster can be withdrawn from the PC into the party.
 * Maximum party size is 6.
 */
export declare function canWithdrawMonster(party: MonsterInstance[]): {
    canWithdraw: boolean;
    reason?: string;
};
/**
 * Performs a deposit of a party monster into box storage.
 */
export declare function depositMonster(party: MonsterInstance[], boxMonsters: MonsterInstance[], monsterId: string, targetBox?: number): {
    success: boolean;
    reason?: string;
    party: MonsterInstance[];
    boxMonsters: MonsterInstance[];
};
/**
 * Performs a withdrawal of a stored monster into the active party.
 */
export declare function withdrawMonster(party: MonsterInstance[], boxMonsters: MonsterInstance[], boxMonsterId: string): {
    success: boolean;
    reason?: string;
    party: MonsterInstance[];
    boxMonsters: MonsterInstance[];
};
/**
 * Swaps a party monster with a box monster directly.
 */
export declare function swapPartyAndBoxMonsters(party: MonsterInstance[], boxMonsters: MonsterInstance[], partyMonsterId: string, boxMonsterId: string): {
    success: boolean;
    reason?: string;
    party: MonsterInstance[];
    boxMonsters: MonsterInstance[];
};
/**
 * Renames a monster's nickname.
 */
export declare function renameMonster(monsters: MonsterInstance[], monsterId: string, newNickname: string): boolean;
