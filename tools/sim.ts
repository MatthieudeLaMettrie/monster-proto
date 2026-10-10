import {
  SPECIES,
  MOVES,
  calculateDamage,
  calculateStat,
  calculateMaxHp,
  SeededRng,
  ElementType
} from '../packages/shared/src/index.js';

// Final stage monsters only (Stage 3)
const stage3Species = SPECIES.filter((s) => s.stage === 3);

interface SimResults {
  battles: number;
  winsByType: Record<ElementType, number>;
  appearancesByType: Record<ElementType, number>;
}

export function runBalanceSimulation(rounds = 10000): SimResults {
  const rng = new SeededRng(1337);

  const winsByType: Record<string, number> = {};
  const appearancesByType: Record<string, number> = {};

  for (const s of stage3Species) {
    winsByType[s.type] = 0;
    appearancesByType[s.type] = 0;
  }

  for (let r = 0; r < rounds; r++) {
    // Pick two random final-stage species
    const idx1 = Math.floor(rng.range(0, stage3Species.length));
    let idx2 = Math.floor(rng.range(0, stage3Species.length));
    while (idx2 === idx1) {
      idx2 = Math.floor(rng.range(0, stage3Species.length));
    }

    const s1 = stage3Species[idx1];
    const s2 = stage3Species[idx2];

    appearancesByType[s1.type]++;
    appearancesByType[s2.type]++;

    // Simulate Lv 15 1v1 match
    let hp1 = calculateMaxHp(s1.baseStats.hp, 15);
    let hp2 = calculateMaxHp(s2.baseStats.hp, 15);

    const spd1 = calculateStat(s1.baseStats.spd, 15);
    const spd2 = calculateStat(s2.baseStats.spd, 15);

    // Give each species their highest tier STAB move
    const moveKey1 = Object.keys(MOVES).find((k) => MOVES[k].type === s1.type && MOVES[k].power >= 65) || 'tackle';
    const moveKey2 = Object.keys(MOVES).find((k) => MOVES[k].type === s2.type && MOVES[k].power >= 65) || 'tackle';

    const move1 = MOVES[moveKey1];
    const move2 = MOVES[moveKey2];

    let winnerType: ElementType | null = null;

    for (let turn = 0; turn < 20; turn++) {
      const p1First = spd1 >= spd2;
      const firstSpecies = p1First ? s1 : s2;
      const secondSpecies = p1First ? s2 : s1;
      const firstMove = p1First ? move1 : move2;
      const secondMove = p1First ? move2 : move1;

      // Turn step 1
      const ctx1 = {
        attackerLevel: 15,
        attackerAtk: calculateStat(firstSpecies.baseStats.atk, 15),
        attackerType: firstSpecies.type,
        defenderDef: calculateStat(secondSpecies.baseStats.def, 15),
        defenderType: secondSpecies.type,
        move: firstMove
      };
      const dmg1 = calculateDamage(ctx1, rng).damage;
      if (p1First) hp2 -= dmg1;
      else hp1 -= dmg1;

      if (hp1 <= 0) {
        winnerType = s2.type;
        break;
      }
      if (hp2 <= 0) {
        winnerType = s1.type;
        break;
      }

      // Turn step 2
      const ctx2 = {
        attackerLevel: 15,
        attackerAtk: calculateStat(secondSpecies.baseStats.atk, 15),
        attackerType: secondSpecies.type,
        defenderDef: calculateStat(firstSpecies.baseStats.def, 15),
        defenderType: firstSpecies.type,
        move: secondMove
      };
      const dmg2 = calculateDamage(ctx2, rng).damage;
      if (p1First) hp1 -= dmg2;
      else hp2 -= dmg2;

      if (hp1 <= 0) {
        winnerType = s2.type;
        break;
      }
      if (hp2 <= 0) {
        winnerType = s1.type;
        break;
      }
    }

    if (winnerType) {
      winsByType[winnerType]++;
    }
  }

  return {
    battles: rounds,
    winsByType: winsByType as Record<ElementType, number>,
    appearancesByType: appearancesByType as Record<ElementType, number>
  };
}

const res = runBalanceSimulation(10000);
console.log('=== Monster Proto Balance Simulation (10,000 Rounds) ===');
console.table(
  Object.keys(res.winsByType).map((type) => {
    const apps = res.appearancesByType[type as ElementType];
    const wins = res.winsByType[type as ElementType];
    const winRate = ((wins / Math.max(1, apps)) * 100).toFixed(1) + '%';
    return {
      Type: type,
      Appearances: apps,
      Wins: wins,
      WinRate: winRate
    };
  })
);
