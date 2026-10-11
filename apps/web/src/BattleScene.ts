import Phaser from 'phaser';
import {
  MonsterInstance,
  getSpecies,
  MOVES,
  calculateDamage,
  calculateCatchChance,
  calculateXpReward,
  totalXpForLevel,
  calculateMaxHp,
  calculateStat,
  getDefaultMoves
} from '@monster-proto/shared';

export interface BattleInitData {
  playerParty: MonsterInstance[];
  wildSpeciesId: number;
  wildLevel: number;
  returnScene: string;
}

export class BattleScene extends Phaser.Scene {
  private playerParty: MonsterInstance[] = [];
  private activePlayerIdx = 0;
  private wildMonster!: MonsterInstance;
  private returnScene = 'OverworldScene';

  private playerSprite!: Phaser.GameObjects.Image;
  private enemySprite!: Phaser.GameObjects.Image;

  private playerHpBar!: Phaser.GameObjects.Graphics;
  private enemyHpBar!: Phaser.GameObjects.Graphics;
  private playerHpText!: Phaser.GameObjects.Text;
  private enemyHpText!: Phaser.GameObjects.Text;

  private dialogueText!: Phaser.GameObjects.Text;
  private menuContainer!: Phaser.GameObjects.Container;
  private movesContainer!: Phaser.GameObjects.Container;

  private isActing = false;

  constructor() {
    super('BattleScene');
  }

  init(data: BattleInitData) {
    this.playerParty = data.playerParty || [];
    this.returnScene = data.returnScene || 'OverworldScene';

    // Find first conscious monster in party
    let firstAliveIdx = this.playerParty.findIndex((m) => m.currentHp > 0);
    if (firstAliveIdx === -1 && this.playerParty.length > 0) {
      // Emergency revitalization if user forgot to heal
      this.playerParty[0].currentHp = this.playerParty[0].maxHp;
      firstAliveIdx = 0;
    }
    this.activePlayerIdx = Math.max(0, firstAliveIdx);

    const enemySpecies = getSpecies(data.wildSpeciesId);
    const maxHp = calculateMaxHp(enemySpecies.baseStats.hp, data.wildLevel);
    this.wildMonster = {
      id: 'wild-' + Date.now(),
      speciesId: enemySpecies.id,
      nickname: enemySpecies.name,
      level: data.wildLevel,
      xp: 0,
      currentHp: maxHp,
      maxHp,
      moves: getDefaultMoves(enemySpecies, data.wildLevel)
    };
  }

  create() {
    // Background arena
    this.add.rectangle(240, 160, 480, 320, 0x1e293b);
    this.add.ellipse(360, 110, 150, 40, 0x334155);
    this.add.ellipse(120, 210, 160, 45, 0x334155);

    const activePlayer = this.playerParty[this.activePlayerIdx];
    const playerSpecies = getSpecies(activePlayer.speciesId);
    const wildSpecies = getSpecies(this.wildMonster.speciesId);

    // Sprites
    this.enemySprite = this.add.image(360, 95, `monster-${wildSpecies.id}`).setScale(1.2);
    this.playerSprite = this.add.image(120, 195, `monster-${playerSpecies.id}`).setScale(1.4);

    // Enemy HUD (Top-Left)
    this.add.rectangle(130, 45, 200, 42, 0x0f172a, 0.85).setStrokeStyle(1, 0x475569);
    this.add.text(40, 30, `${wildSpecies.name} Lv.${this.wildMonster.level}`, {
      fontSize: '12px',
      color: '#fff',
      fontStyle: 'bold'
    });
    this.enemyHpBar = this.add.graphics();
    this.enemyHpText = this.add.text(175, 48, '', { fontSize: '10px', color: '#cbd5e1' });

    // Player HUD (Bottom-Right)
    this.add.rectangle(350, 175, 200, 46, 0x0f172a, 0.85).setStrokeStyle(1, 0x475569);
    this.add.text(260, 158, `${activePlayer.nickname} Lv.${activePlayer.level}`, {
      fontSize: '12px',
      color: '#fff',
      fontStyle: 'bold'
    });
    this.playerHpBar = this.add.graphics();
    this.playerHpText = this.add.text(395, 178, '', { fontSize: '10px', color: '#cbd5e1' });

    // Bottom Action / Dialogue Box
    this.add.rectangle(240, 270, 460, 80, 0x0f172a, 0.95).setStrokeStyle(2, 0x3b82f6);
    this.dialogueText = this.add.text(25, 240, `A wild ${wildSpecies.name} appeared!`, {
      fontSize: '13px',
      color: '#fff',
      wordWrap: { width: 430 }
    });

    this.createActionMenu();
    this.createMovesMenu();
    this.updateHpBars();

    this.time.delayedCall(1200, () => {
      this.dialogueText.setText(`What will ${activePlayer.nickname} do?`);
      this.menuContainer.setVisible(true);
    });
  }

  private createActionMenu() {
    this.menuContainer = this.add.container(240, 275).setVisible(false);

    const buttons = [
      { text: '⚔️ Fight', color: 0xd97706, cb: () => this.showMovesMenu() },
      { text: '🎾 Catch', color: 0x16a34a, cb: () => this.handleCatchAttempt() },
      { text: '🔄 Switch', color: 0x2563eb, cb: () => this.handleSwitch() },
      { text: '🏃 Run', color: 0xdc2626, cb: () => this.handleRun() }
    ];

    buttons.forEach((b, i) => {
      const x = -150 + i * 100;
      const rect = this.add.rectangle(x, 0, 85, 34, b.color)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', b.cb);

      const label = this.add.text(x, 0, b.text, {
        fontSize: '12px',
        color: '#fff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.menuContainer.add([rect, label]);
    });
  }

  private createMovesMenu() {
    this.movesContainer = this.add.container(240, 275).setVisible(false);
    this.rebuildMovesMenu();
  }

  private rebuildMovesMenu() {
    this.movesContainer.removeAll(true);
    const activePlayer = this.playerParty[this.activePlayerIdx];

    activePlayer.moves.forEach((moveId, i) => {
      const move = MOVES[moveId];
      if (!move) return;

      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = -110 + col * 220;
      const y = -15 + row * 32;

      const rect = this.add.rectangle(x, y, 190, 28, 0x1e293b)
        .setStrokeStyle(1, 0x64748b)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.executeTurn(moveId));

      const label = this.add.text(x - 85, y - 7, `${move.name} (${move.type})`, {
        fontSize: '11px',
        color: '#f8fafc',
        fontStyle: 'bold'
      });

      this.movesContainer.add([rect, label]);
    });

    // Back button
    const backBtn = this.add.text(180, 16, 'Back ↩', {
      fontSize: '11px',
      color: '#f87171'
    }).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.movesContainer.setVisible(false);
      this.menuContainer.setVisible(true);
    });
    this.movesContainer.add(backBtn);
  }

  private showMovesMenu() {
    this.menuContainer.setVisible(false);
    this.rebuildMovesMenu();
    this.movesContainer.setVisible(true);
  }

  private updateHpBars() {
    const activePlayer = this.playerParty[this.activePlayerIdx];

    // Enemy HP Bar
    this.enemyHpBar.clear();
    const enemyRatio = Math.max(0, this.wildMonster.currentHp / this.wildMonster.maxHp);
    const enemyColor = enemyRatio > 0.5 ? 0x22c55e : enemyRatio > 0.2 ? 0xeab308 : 0xef4444;
    this.enemyHpBar.fillStyle(0x334155, 1);
    this.enemyHpBar.fillRect(40, 48, 120, 7);
    this.enemyHpBar.fillStyle(enemyColor, 1);
    this.enemyHpBar.fillRect(40, 48, 120 * enemyRatio, 7);
    this.enemyHpText.setText(`${this.wildMonster.currentHp}/${this.wildMonster.maxHp}`);

    // Player HP Bar
    this.playerHpBar.clear();
    const playerRatio = Math.max(0, activePlayer.currentHp / activePlayer.maxHp);
    const playerColor = playerRatio > 0.5 ? 0x22c55e : playerRatio > 0.2 ? 0xeab308 : 0xef4444;
    this.playerHpBar.fillStyle(0x334155, 1);
    this.playerHpBar.fillRect(260, 178, 120, 7);
    this.playerHpBar.fillStyle(playerColor, 1);
    this.playerHpBar.fillRect(260, 178, 120 * playerRatio, 7);
    this.playerHpText.setText(`${activePlayer.currentHp}/${activePlayer.maxHp}`);
  }

  private executeTurn(playerMoveId: string) {
    if (this.isActing) return;
    this.isActing = true;
    this.movesContainer.setVisible(false);

    const activePlayer = this.playerParty[this.activePlayerIdx];
    const playerSpecies = getSpecies(activePlayer.speciesId);
    const enemySpecies = getSpecies(this.wildMonster.speciesId);

    const playerMove = MOVES[playerMoveId] || MOVES['tackle'];
    const enemyMoveId = Phaser.Utils.Array.GetRandom(this.wildMonster.moves) || 'tackle';
    const enemyMove = MOVES[enemyMoveId] || MOVES['tackle'];

    // Speed calculation
    const playerSpd = calculateStat(playerSpecies.baseStats.spd, activePlayer.level);
    const enemySpd = calculateStat(enemySpecies.baseStats.spd, this.wildMonster.level);
    const playerFirst = playerSpd >= enemySpd;

    const firstAttacker = playerFirst ? 'player' : 'enemy';

    this.runAttackStep(firstAttacker, playerMove, enemyMove, () => {
      // If opponent still alive, second step executes
      if (this.wildMonster.currentHp > 0 && activePlayer.currentHp > 0) {
        const secondAttacker = playerFirst ? 'enemy' : 'player';
        this.runAttackStep(secondAttacker, playerMove, enemyMove, () => {
          this.checkTurnEnd();
        });
      } else {
        this.checkTurnEnd();
      }
    });
  }

  private runAttackStep(attacker: 'player' | 'enemy', playerMove: any, enemyMove: any, next: () => void) {
    const activePlayer = this.playerParty[this.activePlayerIdx];
    const playerSpecies = getSpecies(activePlayer.speciesId);
    const enemySpecies = getSpecies(this.wildMonster.speciesId);

    if (attacker === 'player') {
      const ctx = {
        attackerLevel: activePlayer.level,
        attackerAtk: calculateStat(playerSpecies.baseStats.atk, activePlayer.level),
        attackerType: playerSpecies.type,
        defenderDef: calculateStat(enemySpecies.baseStats.def, this.wildMonster.level),
        defenderType: enemySpecies.type,
        move: playerMove
      };

      const res = calculateDamage(ctx);
      this.dialogueText.setText(`${activePlayer.nickname} used ${playerMove.name}!`);

      this.tweens.add({
        targets: this.playerSprite,
        x: '+=20',
        duration: 90,
        yoyo: true,
        onComplete: () => {
          if (res.hit) {
            this.wildMonster.currentHp = Math.max(0, this.wildMonster.currentHp - res.damage);
            this.cameras.main.shake(100, 0.005);
            this.updateHpBars();
            let note = '';
            if (res.typeMultiplier > 1.0) note = " It's super effective!";
            else if (res.typeMultiplier < 1.0) note = " It's not very effective...";
            this.dialogueText.setText(`${activePlayer.nickname} dealt ${res.damage} damage!${note}`);
          } else {
            this.dialogueText.setText(`${activePlayer.nickname}'s attack missed!`);
          }
          this.time.delayedCall(1000, next);
        }
      });
    } else {
      const ctx = {
        attackerLevel: this.wildMonster.level,
        attackerAtk: calculateStat(enemySpecies.baseStats.atk, this.wildMonster.level),
        attackerType: enemySpecies.type,
        defenderDef: calculateStat(playerSpecies.baseStats.def, activePlayer.level),
        defenderType: playerSpecies.type,
        move: enemyMove
      };

      const res = calculateDamage(ctx);
      this.dialogueText.setText(`Wild ${enemySpecies.name} used ${enemyMove.name}!`);

      this.tweens.add({
        targets: this.enemySprite,
        x: '-=20',
        duration: 90,
        yoyo: true,
        onComplete: () => {
          if (res.hit) {
            activePlayer.currentHp = Math.max(0, activePlayer.currentHp - res.damage);
            this.cameras.main.shake(100, 0.005);
            this.updateHpBars();
            this.dialogueText.setText(`Wild ${enemySpecies.name} dealt ${res.damage} damage!`);
          } else {
            this.dialogueText.setText(`Wild ${enemySpecies.name}'s attack missed!`);
          }
          this.time.delayedCall(1000, next);
        }
      });
    }
  }

  private checkTurnEnd() {
    const activePlayer = this.playerParty[this.activePlayerIdx];

    if (this.wildMonster.currentHp <= 0) {
      // Enemy fainted -> award XP & check evolution
      const wildSpecies = getSpecies(this.wildMonster.speciesId);
      const xpReward = calculateXpReward(wildSpecies.baseXp, this.wildMonster.level);
      this.dialogueText.setText(`Wild ${wildSpecies.name} fainted! Won ${xpReward} XP!`);

      this.tweens.add({
        targets: this.enemySprite,
        alpha: 0,
        y: '+=20',
        duration: 400
      });

      activePlayer.xp += xpReward;
      const nextLevelXp = totalXpForLevel(activePlayer.level + 1, getSpecies(activePlayer.speciesId).type);

      if (activePlayer.xp >= nextLevelXp) {
        activePlayer.level++;
        const spec = getSpecies(activePlayer.speciesId);
        activePlayer.maxHp = calculateMaxHp(spec.baseStats.hp, activePlayer.level);
        activePlayer.currentHp = activePlayer.maxHp;

        this.time.delayedCall(1200, () => {
          this.dialogueText.setText(`${activePlayer.nickname} reached Level ${activePlayer.level}!`);
          this.checkEvolution(activePlayer);
        });
      } else {
        this.time.delayedCall(1500, () => this.endBattle(true));
      }
    } else if (activePlayer.currentHp <= 0) {
      this.dialogueText.setText(`${activePlayer.nickname} fainted!`);
      this.tweens.add({
        targets: this.playerSprite,
        alpha: 0,
        y: '+=20',
        duration: 400
      });
      this.time.delayedCall(1500, () => this.endBattle(false));
    } else {
      this.isActing = false;
      this.menuContainer.setVisible(true);
      this.dialogueText.setText(`What will ${activePlayer.nickname} do?`);
    }
  }

  private checkEvolution(playerMon: MonsterInstance) {
    const spec = getSpecies(playerMon.speciesId);
    if (spec.evolvesTo && spec.evolvesAtLevel && playerMon.level >= spec.evolvesAtLevel) {
      const evoSpecies = getSpecies(spec.evolvesTo);
      this.dialogueText.setText(`What? ${spec.name} is evolving into ${evoSpecies.name}!`);

      this.tweens.add({
        targets: this.playerSprite,
        scaleX: 2.0,
        scaleY: 2.0,
        yoyo: true,
        duration: 300,
        repeat: 2,
        onComplete: () => {
          playerMon.speciesId = evoSpecies.id;
          playerMon.nickname = evoSpecies.name;
          playerMon.moves = getDefaultMoves(evoSpecies, playerMon.level);
          this.playerSprite.setTexture(`monster-${evoSpecies.id}`);
          this.dialogueText.setText(`Congratulations! Evolved into ${evoSpecies.name}!`);
          this.time.delayedCall(2000, () => this.endBattle(true));
        }
      });
    } else {
      this.time.delayedCall(1500, () => this.endBattle(true));
    }
  }

  private handleCatchAttempt() {
    if (this.isActing) return;
    this.isActing = true;
    this.menuContainer.setVisible(false);

    const wildSpecies = getSpecies(this.wildMonster.speciesId);
    const catchChance = calculateCatchChance(wildSpecies.stage, this.wildMonster.currentHp, this.wildMonster.maxHp);
    const roll = Math.random();

    this.dialogueText.setText(`Threw a capture capsule at ${wildSpecies.name}...`);

    this.time.delayedCall(1000, () => {
      if (roll <= catchChance) {
        this.dialogueText.setText(`Gotcha! ${wildSpecies.name} was successfully caught!`);
        this.tweens.add({
          targets: this.enemySprite,
          scale: 0,
          duration: 350
        });

        // Add to party or box
        if (this.playerParty.length < 6) {
          this.wildMonster.partySlot = this.playerParty.length;
          this.playerParty.push(this.wildMonster);
        }

        this.time.delayedCall(1600, () => this.endBattle(true));
      } else {
        this.dialogueText.setText(`Oh no! ${wildSpecies.name} broke free!`);
        this.time.delayedCall(1000, () => {
          // Enemy attacks as retaliation
          const enemySpecies = getSpecies(this.wildMonster.speciesId);
          const activePlayer = this.playerParty[this.activePlayerIdx];
          const playerSpecies = getSpecies(activePlayer.speciesId);
          const enemyMove = MOVES[Phaser.Utils.Array.GetRandom(this.wildMonster.moves)];

          const ctx = {
            attackerLevel: this.wildMonster.level,
            attackerAtk: calculateStat(enemySpecies.baseStats.atk, this.wildMonster.level),
            attackerType: enemySpecies.type,
            defenderDef: calculateStat(playerSpecies.baseStats.def, activePlayer.level),
            defenderType: playerSpecies.type,
            move: enemyMove
          };
          const res = calculateDamage(ctx);
          activePlayer.currentHp = Math.max(0, activePlayer.currentHp - res.damage);
          this.updateHpBars();
          this.dialogueText.setText(`Wild ${enemySpecies.name} struck back for ${res.damage} damage!`);

          this.time.delayedCall(1000, () => {
            this.isActing = false;
            this.menuContainer.setVisible(true);
          });
        });
      }
    });
  }

  private handleSwitch() {
    this.dialogueText.setText('No other healthy monsters in party yet!');
  }

  private handleRun() {
    if (this.isActing) return;
    this.isActing = true;
    this.menuContainer.setVisible(false);
    this.dialogueText.setText('Got away safely!');
    this.time.delayedCall(800, () => this.endBattle(true));
  }

  private endBattle(survived: boolean) {
    // Save party progress to localStorage
    try {
      localStorage.setItem('monster_proto_party', JSON.stringify(this.playerParty));
    } catch {}

    this.scene.start(this.returnScene);
  }
}
