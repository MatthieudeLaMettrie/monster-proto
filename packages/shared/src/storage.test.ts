import { describe, it, expect } from 'vitest';
import {
  canDepositMonster,
  canWithdrawMonster,
  findFirstAvailableBoxSlot,
  depositMonster,
  withdrawMonster,
  swapPartyAndBoxMonsters,
  renameMonster,
  BOX_METADATA,
  BOX_CAPACITY,
  TOTAL_STORAGE_CAPACITY,
  MonsterInstance
} from './index.js';

function createMockMon(id: string, hp = 50, maxHp = 50): MonsterInstance {
  return {
    id,
    speciesId: 1,
    nickname: `Mon-${id}`,
    level: 5,
    xp: 0,
    currentHp: hp,
    maxHp,
    moves: ['tackle']
  };
}

describe('PC Storage Box System', () => {
  it('defines 3 boxes with 30 slots each totaling 90 capacity', () => {
    expect(BOX_METADATA).toHaveLength(3);
    expect(BOX_CAPACITY).toBe(30);
    expect(TOTAL_STORAGE_CAPACITY).toBe(90);
  });

  describe('canDepositMonster', () => {
    it('disallows depositing when party has only 1 monster', () => {
      const party = [createMockMon('p1')];
      const res = canDepositMonster(party, 'p1');
      expect(res.canDeposit).toBe(false);
      expect(res.reason).toContain('last remaining');
    });

    it('disallows depositing if the remaining party monsters are all fainted (0 HP)', () => {
      const party = [
        createMockMon('p1', 50, 50), // alive
        createMockMon('p2', 0, 50)   // fainted
      ];
      const res = canDepositMonster(party, 'p1');
      expect(res.canDeposit).toBe(false);
      expect(res.reason).toContain('only conscious');
    });

    it('allows depositing when at least one other conscious monster remains', () => {
      const party = [
        createMockMon('p1', 50, 50),
        createMockMon('p2', 50, 50)
      ];
      const res = canDepositMonster(party, 'p1');
      expect(res.canDeposit).toBe(true);
    });

    it('allows depositing a fainted monster if someone else is alive', () => {
      const party = [
        createMockMon('p1', 50, 50),
        createMockMon('p2', 0, 50)
      ];
      const res = canDepositMonster(party, 'p2');
      expect(res.canDeposit).toBe(true);
    });
  });

  describe('canWithdrawMonster', () => {
    it('allows withdrawal when party has fewer than 6 monsters', () => {
      const party = [createMockMon('p1'), createMockMon('p2')];
      expect(canWithdrawMonster(party).canWithdraw).toBe(true);
    });

    it('disallows withdrawal when party is full (6 monsters)', () => {
      const party = Array.from({ length: 6 }, (_, i) => createMockMon(`p${i}`));
      const res = canWithdrawMonster(party);
      expect(res.canWithdraw).toBe(false);
      expect(res.reason).toContain('party is full');
    });
  });

  describe('findFirstAvailableBoxSlot', () => {
    it('finds slot 0 in box 1 when box is empty', () => {
      const slot = findFirstAvailableBoxSlot([]);
      expect(slot).toEqual({ boxNumber: 1, boxSlot: 0 });
    });

    it('finds next available slot in preferred box', () => {
      const stored = [
        { ...createMockMon('b0'), boxNumber: 2, boxSlot: 0 },
        { ...createMockMon('b1'), boxNumber: 2, boxSlot: 1 }
      ];
      const slot = findFirstAvailableBoxSlot(stored, 2);
      expect(slot).toEqual({ boxNumber: 2, boxSlot: 2 });
    });

    it('spills over to box 2 when box 1 is full', () => {
      const stored: MonsterInstance[] = Array.from({ length: 30 }, (_, i) => ({
        ...createMockMon(`b${i}`),
        boxNumber: 1,
        boxSlot: i
      }));
      const slot = findFirstAvailableBoxSlot(stored, 1);
      expect(slot).toEqual({ boxNumber: 2, boxSlot: 0 });
    });

    it('returns null when all 90 slots are full', () => {
      const stored: MonsterInstance[] = [];
      for (let b = 1; b <= 3; b++) {
        for (let s = 0; s < 30; s++) {
          stored.push({ ...createMockMon(`b-${b}-${s}`), boxNumber: b, boxSlot: s });
        }
      }
      expect(findFirstAvailableBoxSlot(stored, 1)).toBeNull();
    });
  });

  describe('depositMonster & withdrawMonster', () => {
    it('deposits party monster into box and clears partySlot', () => {
      const party = [createMockMon('p1'), createMockMon('p2')];
      const box: MonsterInstance[] = [];

      const res = depositMonster(party, box, 'p1', 1);
      expect(res.success).toBe(true);
      expect(res.party).toHaveLength(1);
      expect(res.party[0].id).toBe('p2');
      expect(res.party[0].partySlot).toBe(0);
      expect(res.boxMonsters).toHaveLength(1);
      expect(res.boxMonsters[0].id).toBe('p1');
      expect(res.boxMonsters[0].partySlot).toBeNull();
      expect(res.boxMonsters[0].boxNumber).toBe(1);
      expect(res.boxMonsters[0].boxSlot).toBe(0);
    });

    it('withdraws box monster into party and sets partySlot', () => {
      const party = [createMockMon('p1')];
      const box = [{ ...createMockMon('b1'), boxNumber: 1, boxSlot: 0 }];

      const res = withdrawMonster(party, box, 'b1');
      expect(res.success).toBe(true);
      expect(res.party).toHaveLength(2);
      expect(res.party[1].id).toBe('b1');
      expect(res.party[1].partySlot).toBe(1);
      expect(res.party[1].boxNumber).toBeUndefined();
      expect(res.boxMonsters).toHaveLength(0);
    });
  });

  describe('swapPartyAndBoxMonsters', () => {
    it('swaps party and box monsters cleanly', () => {
      const party = [createMockMon('p1'), createMockMon('p2')];
      const box = [{ ...createMockMon('b1'), boxNumber: 1, boxSlot: 5 }];

      const res = swapPartyAndBoxMonsters(party, box, 'p1', 'b1');
      expect(res.success).toBe(true);
      expect(res.party[0].id).toBe('b1');
      expect(res.party[0].partySlot).toBe(0);
      expect(res.boxMonsters[0].id).toBe('p1');
      expect(res.boxMonsters[0].boxNumber).toBe(1);
      expect(res.boxMonsters[0].boxSlot).toBe(5);
    });
  });

  describe('renameMonster', () => {
    it('updates nickname within length limit', () => {
      const team = [createMockMon('m1')];
      const ok = renameMonster(team, 'm1', 'BlazeMaster');
      expect(ok).toBe(true);
      expect(team[0].nickname).toBe('BlazeMaster');
    });

    it('rejects empty or excessively long nicknames', () => {
      const team = [createMockMon('m1')];
      expect(renameMonster(team, 'm1', '')).toBe(false);
      expect(renameMonster(team, 'm1', '   ')).toBe(false);
      expect(renameMonster(team, 'm1', 'ThisNameIsWayTooLongForTheSystemToAllow')).toBe(false);
      expect(team[0].nickname).toBe('Mon-m1');
    });
  });
});
