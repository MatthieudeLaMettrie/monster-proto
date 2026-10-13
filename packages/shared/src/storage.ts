import { MonsterInstance } from './types.js';

export const TOTAL_BOXES = 3;
export const BOX_CAPACITY = 30; // 30 slots per box
export const TOTAL_STORAGE_CAPACITY = TOTAL_BOXES * BOX_CAPACITY; // 90 monsters total

export interface BoxMetadata {
  boxNumber: number;
  name: string;
  themeColor: number;
  bgHex: string;
}

export const BOX_METADATA: BoxMetadata[] = [
  { boxNumber: 1, name: 'Box 1: Meadow & Grove', themeColor: 0x166534, bgHex: '#14532d' },
  { boxNumber: 2, name: 'Box 2: Azure Waters', themeColor: 0x0369a1, bgHex: '#0c4a6e' },
  { boxNumber: 3, name: 'Box 3: Volcanic Apex', themeColor: 0x991b1b, bgHex: '#7f1d1d' }
];

export function getBoxMetadata(boxNumber: number): BoxMetadata {
  return BOX_METADATA.find(b => b.boxNumber === boxNumber) || BOX_METADATA[0];
}

/**
 * Finds the first available slot across storage boxes.
 * Prefers the provided box number, then searches sequentially 1..3.
 */
export function findFirstAvailableBoxSlot(
  boxMonsters: MonsterInstance[],
  preferredBox: number = 1
): { boxNumber: number; boxSlot: number } | null {
  // Check preferred box first
  const boxesToCheck = [
    preferredBox,
    ...[1, 2, 3].filter(b => b !== preferredBox)
  ];

  for (const boxNum of boxesToCheck) {
    const occupiedSlots = new Set(
      boxMonsters
        .filter(m => (m.boxNumber || 1) === boxNum)
        .map(m => m.boxSlot ?? -1)
    );

    for (let slot = 0; slot < BOX_CAPACITY; slot++) {
      if (!occupiedSlots.has(slot)) {
        return { boxNumber: boxNum, boxSlot: slot };
      }
    }
  }

  return null;
}

/**
 * Validates whether a monster can be safely deposited into the PC.
 * A trainer cannot deposit their last monster or deposit their only conscious monster.
 */
export function canDepositMonster(
  party: MonsterInstance[],
  monsterId: string
): { canDeposit: boolean; reason?: string } {
  if (party.length <= 1) {
    return { canDeposit: false, reason: 'You cannot deposit your last remaining party monster!' };
  }

  const mon = party.find(m => m.id === monsterId);
  if (!mon) {
    return { canDeposit: false, reason: 'Monster not found in party.' };
  }

  // Check if remaining party would have at least 1 conscious monster
  const otherAlive = party.filter(m => m.id !== monsterId && m.currentHp > 0);
  if (mon.currentHp > 0 && otherAlive.length === 0) {
    return { canDeposit: false, reason: 'You cannot deposit your only conscious monster!' };
  }

  return { canDeposit: true };
}

/**
 * Validates whether a monster can be withdrawn from the PC into the party.
 * Maximum party size is 6.
 */
export function canWithdrawMonster(party: MonsterInstance[]): { canWithdraw: boolean; reason?: string } {
  if (party.length >= 6) {
    return { canWithdraw: false, reason: 'Your party is full (maximum 6 monsters)! Deposit a monster first.' };
  }
  return { canWithdraw: true };
}

/**
 * Performs a deposit of a party monster into box storage.
 */
export function depositMonster(
  party: MonsterInstance[],
  boxMonsters: MonsterInstance[],
  monsterId: string,
  targetBox: number = 1
): { success: boolean; reason?: string; party: MonsterInstance[]; boxMonsters: MonsterInstance[] } {
  const check = canDepositMonster(party, monsterId);
  if (!check.canDeposit) {
    return { success: false, reason: check.reason, party, boxMonsters };
  }

  const slot = findFirstAvailableBoxSlot(boxMonsters, targetBox);
  if (!slot) {
    return { success: false, reason: 'All PC storage boxes are completely full (90/90)!', party, boxMonsters };
  }

  const idx = party.findIndex(m => m.id === monsterId);
  const [mon] = party.splice(idx, 1);

  // Update party slots
  party.forEach((m, i) => {
    m.partySlot = i;
  });

  // Assign box slot
  mon.partySlot = null;
  mon.boxNumber = slot.boxNumber;
  mon.boxSlot = slot.boxSlot;

  const newBoxMonsters = [...boxMonsters, mon];
  return { success: true, party: [...party], boxMonsters: newBoxMonsters };
}

/**
 * Performs a withdrawal of a stored monster into the active party.
 */
export function withdrawMonster(
  party: MonsterInstance[],
  boxMonsters: MonsterInstance[],
  boxMonsterId: string
): { success: boolean; reason?: string; party: MonsterInstance[]; boxMonsters: MonsterInstance[] } {
  const check = canWithdrawMonster(party);
  if (!check.canWithdraw) {
    return { success: false, reason: check.reason, party, boxMonsters };
  }

  const idx = boxMonsters.findIndex(m => m.id === boxMonsterId);
  if (idx === -1) {
    return { success: false, reason: 'Monster not found in PC Box.', party, boxMonsters };
  }

  const [mon] = boxMonsters.splice(idx, 1);
  mon.partySlot = party.length;
  mon.boxNumber = undefined;
  mon.boxSlot = undefined;

  const newParty = [...party, mon];
  return { success: true, party: newParty, boxMonsters: [...boxMonsters] };
}

/**
 * Swaps a party monster with a box monster directly.
 */
export function swapPartyAndBoxMonsters(
  party: MonsterInstance[],
  boxMonsters: MonsterInstance[],
  partyMonsterId: string,
  boxMonsterId: string
): { success: boolean; reason?: string; party: MonsterInstance[]; boxMonsters: MonsterInstance[] } {
  const pIdx = party.findIndex(m => m.id === partyMonsterId);
  const bIdx = boxMonsters.findIndex(m => m.id === boxMonsterId);

  if (pIdx === -1 || bIdx === -1) {
    return { success: false, reason: 'Monsters to swap not found.', party, boxMonsters };
  }

  const partyMon = party[pIdx];
  const boxMon = boxMonsters[bIdx];

  // Check if swapping would leave 0 conscious monsters in party
  if (partyMon.currentHp > 0 && boxMon.currentHp <= 0) {
    const otherAlive = party.filter(m => m.id !== partyMonsterId && m.currentHp > 0);
    if (otherAlive.length === 0) {
      return { success: false, reason: 'Swapping would leave your party with no conscious monsters!', party, boxMonsters };
    }
  }

  // Swap positions and metadata
  const originalBoxNum = boxMon.boxNumber || 1;
  const originalBoxSlot = boxMon.boxSlot ?? 0;

  partyMon.partySlot = null;
  partyMon.boxNumber = originalBoxNum;
  partyMon.boxSlot = originalBoxSlot;

  boxMon.partySlot = pIdx;
  boxMon.boxNumber = undefined;
  boxMon.boxSlot = undefined;

  party[pIdx] = boxMon;
  boxMonsters[bIdx] = partyMon;

  return { success: true, party: [...party], boxMonsters: [...boxMonsters] };
}

/**
 * Renames a monster's nickname.
 */
export function renameMonster(
  monsters: MonsterInstance[],
  monsterId: string,
  newNickname: string
): boolean {
  const trimmed = newNickname.trim();
  if (!trimmed || trimmed.length > 20) return false;

  const target = monsters.find(m => m.id === monsterId);
  if (!target) return false;

  target.nickname = trimmed;
  return true;
}
