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
  getDefaultMoves,
  ITEMS,
  DEFAULT_INVENTORY,
  InventoryBag,
  canAct,
  calculateStatusResidual,
  rollStatusProc,
  MonsterStatus
} from '@monster-proto/shared';
import { Sound } from './SoundManager.js';
import { PersistenceManager } from './persistence.js';
import { createTrainerTextures } from './TrainerTexture.js';

export interface BattleInitData {
  playerParty: MonsterInstance[];
  wildSpeciesId?: number;
  wildLevel?: number;
  returnScene: string;
  returnTile?: { x: number; y: number };
  isTrainerBattle?: boolean;
  trainerName?: string;
  trainerParty?: MonsterInstance[];
}

export class BattleScene extends Phaser.Scene {
  private playerParty: MonsterInstance[] = [];
  private activePlayerIdx = 0;
  private wildMonster!: MonsterInstance;
  private returnScene = 'OverworldScene';
  private returnTile?: { x: number; y: number };

  private isTrainerBattle = false;
  private trainerName = 'Trainer';
  private trainerParty: MonsterInstance[] = [];
  private activeTrainerIdx = 0;

  private playerSprite!: Phaser.GameObjects.Image;
  private enemySprite!: Phaser.GameObjects.Image;
  private trainerBackSprite?: Phaser.GameObjects.Image;

  private playerHpBar!: Phaser.GameObjects.Graphics;
  private enemyHpBar!: Phaser.GameObjects.Graphics;
  private playerHpText!: Phaser.GameObjects.Text;
  private enemyHpText!: Phaser.GameObjects.Text;
  private enemyNameText!: Phaser.GameObjects.Text;
  private playerNameText!: Phaser.GameObjects.Text;
  private playerStatusBadge!: Phaser.GameObjects.Text;
  private enemyStatusBadge!: Phaser.GameObjects.Text;

  private dialogueText!: Phaser.GameObjects.Text;
  private menuContainer!: Phaser.GameObjects.Container;
  private movesContainer!: Phaser.GameObjects.Container;
  private bagContainer!: Phaser.GameObjects.Container;
  private switchContainer!: Phaser.GameObjects.Container;

  private isActing = false;

  private playerBreathingTween?: Phaser.Tweens.Tween;
  private enemyBreathingTween?: Phaser.Tweens.Tween;
  private playerAura?: Phaser.GameObjects.Arc;
  private enemyAura?: Phaser.GameObjects.Arc;
  private playerAuraTween?: Phaser.Tweens.Tween;
  private enemyAuraTween?: Phaser.Tweens.Tween;

  constructor() {
    super('BattleScene');
  }

  private getFallbackParty(): MonsterInstance[] {
    const raw = localStorage.getItem('monster_proto_party');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    const starterSpecies = getSpecies(1);
    const maxHp = calculateMaxHp(starterSpecies.baseStats.hp, 5);
    return [{
      id: 'starter-1',
      speciesId: 1,
      nickname: 'Emberpup',
      level: 5,
      xp: 0,
      currentHp: maxHp,
      maxHp,
      moves: ['tackle', 'ember_nip'],
      partySlot: 0
    }];
  }

  private getInventory(): InventoryBag {
    const raw = localStorage.getItem('monster_proto_inventory');
    if (raw) {
      try {
        return { ...DEFAULT_INVENTORY, ...JSON.parse(raw) };
      } catch {}
    }
    return { ...DEFAULT_INVENTORY };
  }

  private saveInventory(inv: InventoryBag) {
    try {
      localStorage.setItem('monster_proto_inventory', JSON.stringify(inv));
    } catch {}
  }

  init(data: BattleInitData) {
    this.isActing = false;
    this.returnScene = data.returnScene || 'OverworldScene';
    this.returnTile = data.returnTile;
    this.isTrainerBattle = !!data.isTrainerBattle;
    this.trainerName = data.trainerName || 'Master Aaron';
    this.activeTrainerIdx = 0;

    let party = (data.playerParty && Array.isArray(data.playerParty) && data.playerParty.length > 0)
      ? data.playerParty
      : this.getFallbackParty();

    // Sanitize player party
    this.playerParty = party.map((m, idx) => {
      const spec = getSpecies(m.speciesId || 1);
      const lvl = Math.max(1, m.level || 5);
      const maxHp = m.maxHp || calculateMaxHp(spec.baseStats.hp, lvl);
      const moves = Array.isArray(m.moves) && m.moves.length > 0 ? m.moves : getDefaultMoves(spec, lvl);
      const movePp: Record<string, number> = { ...(m.movePp || {}) };
      moves.forEach((mId) => {
        if (typeof movePp[mId] !== 'number' && MOVES[mId]) {
          movePp[mId] = MOVES[mId].maxPp;
        }
      });

      return {
        id: m.id || `mon-${idx}-${Date.now()}`,
        speciesId: spec.id,
        nickname: m.nickname || spec.name,
        level: lvl,
        xp: m.xp || 0,
        currentHp: typeof m.currentHp === 'number' ? m.currentHp : maxHp,
        maxHp,
        moves,
        movePp,
        status: m.status || null,
        partySlot: idx
      };
    });

    // Find first conscious monster in player party
    let firstAliveIdx = this.playerParty.findIndex((m) => m.currentHp > 0);
    if (firstAliveIdx === -1 && this.playerParty.length > 0) {
      this.playerParty[0].currentHp = this.playerParty[0].maxHp;
      firstAliveIdx = 0;
    }
    this.activePlayerIdx = Math.max(0, firstAliveIdx);

    if (this.isTrainerBattle && data.trainerParty && data.trainerParty.length > 0) {
      this.trainerParty = data.trainerParty;
      this.wildMonster = this.trainerParty[0];
    } else {
      const wildId = data.wildSpeciesId || 19;
      const wildLvl = Math.max(1, data.wildLevel || 3);
      const enemySpecies = getSpecies(wildId);
      const maxHp = calculateMaxHp(enemySpecies.baseStats.hp, wildLvl);
      const enemyMoves = getDefaultMoves(enemySpecies, wildLvl);
      const enemyPp: Record<string, number> = {};
      enemyMoves.forEach(mId => {
        if (MOVES[mId]) enemyPp[mId] = MOVES[mId].maxPp;
      });

      this.wildMonster = {
        id: 'wild-' + Date.now(),
        speciesId: enemySpecies.id,
        nickname: enemySpecies.name,
        level: wildLvl,
        xp: 0,
        currentHp: maxHp,
        maxHp,
        moves: enemyMoves,
        movePp: enemyPp,
        status: null
      };
    }

    if (!this.wildMonster.movePp) {
      this.wildMonster.movePp = {};
      this.wildMonster.moves.forEach(mId => {
        if (MOVES[mId]) this.wildMonster.movePp![mId] = MOVES[mId].maxPp;
      });
    }
  }

  create() {
    this.isActing = false;
    this.events.once('shutdown', () => {
      this.isActing = false;
      this.tweens.killAll();
    });

    // Background arena
    this.add.rectangle(240, 160, 480, 320, 0x1e293b);
    this.add.ellipse(360, 110, 150, 40, 0x334155);
    this.add.ellipse(120, 210, 160, 45, 0x334155);

    const activePlayer = this.playerParty[this.activePlayerIdx];
    const playerSpecies = getSpecies(activePlayer.speciesId);
    const enemySpecies = getSpecies(this.wildMonster.speciesId);

    createTrainerTextures(this);

    // Sprites
    this.enemySprite = this.add.image(360, 95, `monster-${enemySpecies.id}`).setScale(1.2);
    this.playerSprite = this.add.image(120, 195, `monster-${playerSpecies.id}`).setScale(0); // Starts collapsed in capsule

    // Trainer Back-Sprite send-out sequence
    this.trainerBackSprite = this.add.image(90, 205, 'trainer-back-idle').setScale(1.7).setDepth(15);

    this.time.delayedCall(300, () => {
      if (this.trainerBackSprite && this.trainerBackSprite.active) {
        this.trainerBackSprite.setTexture('trainer-back-windup');
      }
    });

    this.time.delayedCall(600, () => {
      if (!this.trainerBackSprite || !this.trainerBackSprite.active) return;
      this.trainerBackSprite.setTexture('trainer-back-throw');

      const capsule = this.add.circle(105, 190, 5, 0xef4444).setStrokeStyle(1.5, 0xffffff).setDepth(20);
      Sound.playGrassStep();

      this.tweens.add({
        targets: capsule,
        x: 120,
        y: 195,
        duration: 250,
        ease: 'Quad.easeOut',
        onComplete: () => {
          capsule.destroy();
          Sound.playCatchSuccess();
          this.triggerCapsulePop(120, 195);

          // Summon player monster
          this.tweens.add({
            targets: this.playerSprite,
            scale: 1.4,
            duration: 250,
            ease: 'Back.easeOut',
            onComplete: () => {
              this.updatePlayerVisuals(false);
            }
          });

          // Trainer slides smoothly off to the left
          this.tweens.add({
            targets: this.trainerBackSprite,
            x: -80,
            alpha: 0,
            duration: 450,
            ease: 'Sine.easeIn',
            onComplete: () => {
              this.trainerBackSprite?.destroy();
              this.trainerBackSprite = undefined;
            }
          });
        }
      });
    });

    this.updateEnemyVisuals(true);

    // Enemy HUD (Top-Left)
    this.add.rectangle(130, 45, 200, 42, 0x0f172a, 0.85).setStrokeStyle(1, 0x475569);
    this.enemyNameText = this.add.text(40, 30, `${this.wildMonster.nickname} Lv.${this.wildMonster.level}`, {
      fontSize: '12px',
      color: '#fff',
      fontStyle: 'bold'
    });
    this.enemyStatusBadge = this.add.text(180, 29, '', {
      fontSize: '9px',
      color: '#ffffff',
      fontStyle: 'bold',
      padding: { x: 3, y: 1 }
    }).setOrigin(0, 0);
    this.enemyHpBar = this.add.graphics();
    this.enemyHpText = this.add.text(175, 48, '', { fontSize: '10px', color: '#cbd5e1' });

    // Player HUD (Bottom-Right)
    this.add.rectangle(350, 175, 200, 46, 0x0f172a, 0.85).setStrokeStyle(1, 0x475569);
    this.playerNameText = this.add.text(260, 158, `${activePlayer.nickname} Lv.${activePlayer.level}`, {
      fontSize: '12px',
      color: '#fff',
      fontStyle: 'bold'
    });
    this.playerStatusBadge = this.add.text(400, 157, '', {
      fontSize: '9px',
      color: '#ffffff',
      fontStyle: 'bold',
      padding: { x: 3, y: 1 }
    }).setOrigin(0, 0);
    this.playerHpBar = this.add.graphics();
    this.playerHpText = this.add.text(395, 178, '', { fontSize: '10px', color: '#cbd5e1' });

    // Bottom Action / Dialogue Box
    this.add.rectangle(240, 270, 460, 80, 0x0f172a, 0.95).setStrokeStyle(2, 0x3b82f6);
    const encounterIntro = this.isTrainerBattle
      ? `${this.trainerName} challenges you! Sent out ${this.wildMonster.nickname}!`
      : `A wild ${enemySpecies.name} appeared!`;

    this.dialogueText = this.add.text(25, 240, encounterIntro, {
      fontSize: '13px',
      color: '#fff',
      wordWrap: { width: 430 }
    });

    this.createActionMenu();
    this.createMovesMenu();
    this.createBagMenu();
    this.createSwitchMenu();
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
      { text: '🎒 Bag', color: 0x16a34a, cb: () => this.showBagMenu() },
      { text: '🔄 Switch', color: 0x2563eb, cb: () => this.showSwitchMenu() },
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
    if (!activePlayer.movePp) activePlayer.movePp = {};

    activePlayer.moves.forEach((moveId, i) => {
      const move = MOVES[moveId];
      if (!move) return;

      const maxPp = move.maxPp || 35;
      const currentPp = activePlayer.movePp![moveId] ?? maxPp;
      activePlayer.movePp![moveId] = currentPp;

      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = -110 + col * 220;
      const y = -15 + row * 32;

      const hasPp = currentPp > 0;
      const rect = this.add.rectangle(x, y, 190, 28, hasPp ? 0x1e293b : 0x0f172a)
        .setStrokeStyle(1, hasPp ? 0x3b82f6 : 0x475569)
        .setInteractive({ useHandCursor: hasPp })
        .on('pointerdown', () => {
          if (hasPp) this.executeTurn(moveId);
        });

      const label = this.add.text(x - 85, y - 7, `${move.name} (${currentPp}/${maxPp} PP)`, {
        fontSize: '10px',
        color: hasPp ? '#f8fafc' : '#64748b',
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

  // --- Bag Menu System ---
  private createBagMenu() {
    this.bagContainer = this.add.container(240, 275).setVisible(false);
  }

  private showBagMenu() {
    this.menuContainer.setVisible(false);
    this.rebuildBagMenu();
    this.bagContainer.setVisible(true);
  }

  private rebuildBagMenu() {
    this.bagContainer.removeAll(true);
    const inventory = this.getInventory();

    const availableItems = Object.keys(ITEMS).map((id) => ({
      item: ITEMS[id],
      count: inventory[id] || 0
    }));

    availableItems.forEach((entry, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = -110 + col * 220;
      const y = -18 + row * 26;

      const isDisabled = entry.count <= 0;
      const rect = this.add.rectangle(x, y, 190, 24, isDisabled ? 0x0f172a : 0x1e293b)
        .setStrokeStyle(1, isDisabled ? 0x334155 : 0x16a34a)
        .setInteractive({ useHandCursor: !isDisabled })
        .on('pointerdown', () => {
          if (!isDisabled) this.useBagItem(entry.item.id);
        });

      const label = this.add.text(x - 85, y - 6, `${entry.item.name} x${entry.count}`, {
        fontSize: '10px',
        color: isDisabled ? '#64748b' : '#f8fafc',
        fontStyle: 'bold'
      });

      this.bagContainer.add([rect, label]);
    });

    const backBtn = this.add.text(180, 16, 'Back ↩', {
      fontSize: '11px',
      color: '#f87171'
    }).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.bagContainer.setVisible(false);
      this.menuContainer.setVisible(true);
    });
    this.bagContainer.add(backBtn);
  }

  private useBagItem(itemId: string) {
    if (this.isActing) return;
    this.isActing = true;
    this.bagContainer.setVisible(false);

    const inventory = this.getInventory();
    if ((inventory[itemId] || 0) <= 0) {
      this.isActing = false;
      this.showBagMenu();
      return;
    }

    const item = ITEMS[itemId];
    const activePlayer = this.playerParty[this.activePlayerIdx];

    if (item.category === 'capture') {
      if (this.isTrainerBattle) {
        this.dialogueText.setText(`${this.trainerName} swats it away! "You can't catch a Trainer's monster!"`);
        this.time.delayedCall(1400, () => {
          this.isActing = false;
          this.menuContainer.setVisible(true);
        });
        return;
      }
      inventory[itemId]--;
      this.saveInventory(inventory);
      this.handleCatchAttempt(item.value);
      return;
    }

    if (item.category === 'healing') {
      if (activePlayer.currentHp >= activePlayer.maxHp) {
        this.dialogueText.setText(`${activePlayer.nickname} is already at full HP!`);
        this.time.delayedCall(1000, () => {
          this.isActing = false;
          this.showBagMenu();
        });
        return;
      }
      inventory[itemId]--;
      this.saveInventory(inventory);

      activePlayer.currentHp = Math.min(activePlayer.maxHp, activePlayer.currentHp + item.value);
      Sound.playRevitalize();
      this.updateHpBars();
      this.dialogueText.setText(`Used ${item.name}! ${activePlayer.nickname} recovered HP!`);

      this.time.delayedCall(1200, () => {
        // Opponent retaliates as turn penalty
        this.enemyRetaliateTurn();
      });
      return;
    }

    if (item.category === 'revive') {
      const faintedMon = this.playerParty.find(m => m.currentHp <= 0);
      if (!faintedMon) {
        this.dialogueText.setText('No fainted monsters to revive!');
        this.time.delayedCall(1000, () => {
          this.isActing = false;
          this.showBagMenu();
        });
        return;
      }
      inventory[itemId]--;
      this.saveInventory(inventory);

      faintedMon.currentHp = Math.floor(faintedMon.maxHp * item.value);
      Sound.playRevitalize();
      this.updateHpBars();
      this.dialogueText.setText(`Revived ${faintedMon.nickname}! Restored to half HP!`);

      this.time.delayedCall(1200, () => {
        this.enemyRetaliateTurn();
      });
      return;
    }

    if (item.category === 'status_cure') {
      if (!activePlayer.status || (item.curesCondition && item.curesCondition !== 'all' && activePlayer.status.condition !== item.curesCondition)) {
        this.dialogueText.setText(`It won't have any effect on ${activePlayer.nickname}!`);
        this.time.delayedCall(1000, () => {
          this.isActing = false;
          this.showBagMenu();
        });
        return;
      }

      inventory[itemId]--;
      this.saveInventory(inventory);
      const curedCondition = activePlayer.status.condition;
      activePlayer.status = null;
      Sound.playRevitalize();
      this.updateHpBars();
      this.dialogueText.setText(`Used ${item.name}! ${activePlayer.nickname} was cured of ${curedCondition}!`);

      this.time.delayedCall(1200, () => {
        this.enemyRetaliateTurn();
      });
      return;
    }
  }

  // --- Switch Menu System ---
  private createSwitchMenu() {
    this.switchContainer = this.add.container(240, 275).setVisible(false);
  }

  private showSwitchMenu(forced = false) {
    this.menuContainer.setVisible(false);
    this.rebuildSwitchMenu(forced);
    this.switchContainer.setVisible(true);
  }

  private rebuildSwitchMenu(forced = false) {
    this.switchContainer.removeAll(true);

    this.playerParty.forEach((mon, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = -110 + col * 220;
      const y = -18 + row * 26;

      const isCurrent = i === this.activePlayerIdx;
      const isFainted = mon.currentHp <= 0;
      const canSelect = !isCurrent && !isFainted;

      const spec = getSpecies(mon.speciesId);
      const rect = this.add.rectangle(x, y, 190, 24, isCurrent ? 0x1e3a8a : isFainted ? 0x3f1212 : 0x1e293b)
        .setStrokeStyle(1, isCurrent ? 0x60a5fa : canSelect ? 0x22c55e : 0x475569)
        .setInteractive({ useHandCursor: canSelect })
        .on('pointerdown', () => {
          if (canSelect) this.executeSwitch(i, forced);
        });

      const label = this.add.text(x - 85, y - 6, `${mon.nickname} Lv.${mon.level} (${mon.currentHp}/${mon.maxHp})`, {
        fontSize: '10px',
        color: isFainted ? '#ef4444' : isCurrent ? '#93c5fd' : '#fff',
        fontStyle: 'bold'
      });

      this.switchContainer.add([rect, label]);
    });

    if (!forced) {
      const backBtn = this.add.text(180, 16, 'Back ↩', {
        fontSize: '11px',
        color: '#f87171'
      }).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        this.switchContainer.setVisible(false);
        this.menuContainer.setVisible(true);
      });
      this.switchContainer.add(backBtn);
    }
  }

  private executeSwitch(newIdx: number, forced = false) {
    this.switchContainer.setVisible(false);
    this.isActing = true;

    const oldMon = this.playerParty[this.activePlayerIdx];
    this.activePlayerIdx = newIdx;
    const newMon = this.playerParty[this.activePlayerIdx];
    const newSpec = getSpecies(newMon.speciesId);

    this.dialogueText.setText(`Come back, ${oldMon.nickname}! Go, ${newMon.nickname}!`);

    this.tweens.add({
      targets: this.playerSprite,
      scale: 0,
      duration: 250,
      onComplete: () => {
        this.playerSprite.setTexture(`monster-${newSpec.id}`);
        this.playerNameText.setText(`${newMon.nickname} Lv.${newMon.level}`);
        this.updateHpBars();

        this.tweens.add({
          targets: this.playerSprite,
          scale: 1.4,
          duration: 250,
          onComplete: () => {
            this.updatePlayerVisuals(true);
            if (forced) {
              this.isActing = false;
              this.menuContainer.setVisible(true);
              this.dialogueText.setText(`What will ${newMon.nickname} do?`);
            } else {
              this.time.delayedCall(800, () => {
                this.enemyRetaliateTurn();
              });
            }
          }
        });
      }
    });
  }

  private enemyRetaliateTurn() {
    const enemySpecies = getSpecies(this.wildMonster.speciesId);
    const activePlayer = this.playerParty[this.activePlayerIdx];
    const playerSpecies = getSpecies(activePlayer.speciesId);

    // Check status condition action prevention (Sleep, Freeze, Paralysis)
    const statusCheck = canAct(this.wildMonster.status);
    if (statusCheck.statusUpdate !== undefined) {
      this.wildMonster.status = statusCheck.statusUpdate;
      this.updateStatusBadges();
    }

    if (!statusCheck.canAct) {
      this.dialogueText.setText(`${this.wildMonster.nickname} ${statusCheck.reason}`);
      Sound.playHit(false);
      this.time.delayedCall(1200, () => {
        this.applyEndTurnResiduals();
      });
      return;
    }

    const enemyAvailableMoves = this.wildMonster.moves.filter(m => (this.wildMonster.movePp?.[m] ?? 1) > 0);
    const enemyMoveId = enemyAvailableMoves.length > 0 ? Phaser.Utils.Array.GetRandom(enemyAvailableMoves) : 'tackle';
    const enemyMove = MOVES[enemyMoveId] || MOVES['tackle'];
    if (this.wildMonster.movePp) {
      this.wildMonster.movePp[enemyMoveId] = Math.max(0, (this.wildMonster.movePp[enemyMoveId] ?? enemyMove.maxPp) - 1);
    }

    const ctx = {
      attackerLevel: this.wildMonster.level,
      attackerAtk: calculateStat(enemySpecies.baseStats.atk, this.wildMonster.level),
      attackerType: enemySpecies.type,
      attackerStatus: this.wildMonster.status,
      defenderDef: calculateStat(playerSpecies.baseStats.def, activePlayer.level),
      defenderType: playerSpecies.type,
      move: enemyMove
    };

    const res = calculateDamage(ctx);
    let introText = statusCheck.reason ? `${this.wildMonster.nickname} ${statusCheck.reason} ` : '';
    introText += `${this.wildMonster.nickname} used ${enemyMove.name}!`;
    this.dialogueText.setText(introText);

    this.tweens.add({
      targets: this.enemySprite,
      x: '-=20',
      duration: 90,
      yoyo: true,
      onComplete: () => {
        if (res.hit) {
          Sound.playHit(res.typeMultiplier > 1);
          activePlayer.currentHp = Math.max(0, activePlayer.currentHp - res.damage);
          this.cameras.main.shake(100, 0.005);
          this.updateHpBars();

          let note = '';
          if (res.typeMultiplier > 1.0) note = " It's super effective!";
          else if (res.typeMultiplier < 1.0) note = " It's not very effective...";

          const newStatus = rollStatusProc(enemyMove, activePlayer.status);
          if (newStatus && activePlayer.currentHp > 0) {
            activePlayer.status = newStatus;
            this.updateStatusBadges();
            const condName = newStatus.condition === 'burn' ? 'burned'
              : newStatus.condition === 'poison' ? 'poisoned'
              : newStatus.condition === 'paralysis' ? 'paralyzed'
              : newStatus.condition === 'freeze' ? 'frozen solid'
              : 'put to sleep';
            note += ` ${activePlayer.nickname} was ${condName}!`;
          }

          this.dialogueText.setText(`${this.wildMonster.nickname} dealt ${res.damage} damage!${note}`);
        } else {
          this.dialogueText.setText(`${this.wildMonster.nickname}'s attack missed!`);
        }
        this.time.delayedCall(1100, () => {
          this.applyEndTurnResiduals();
        });
      }
    });
  }

  private updateStatusBadges() {
    const activePlayer = this.playerParty[this.activePlayerIdx];

    const getBadgeInfo = (status?: MonsterStatus | null) => {
      if (!status) return { text: '', bg: '' };
      switch (status.condition) {
        case 'burn': return { text: ' BRN ', bg: '#ea580c' };
        case 'poison': return { text: ' PSN ', bg: '#9333ea' };
        case 'paralysis': return { text: ' PAR ', bg: '#ca8a04' };
        case 'sleep': return { text: ' SLP ', bg: '#2563eb' };
        case 'freeze': return { text: ' FRZ ', bg: '#0891b2' };
        default: return { text: '', bg: '' };
      }
    };

    if (this.playerStatusBadge) {
      const p = getBadgeInfo(activePlayer?.status);
      this.playerStatusBadge.setText(p.text);
      if (p.bg) this.playerStatusBadge.setBackgroundColor(p.bg);
      this.playerStatusBadge.setVisible(Boolean(p.text));
    }

    if (this.enemyStatusBadge) {
      const e = getBadgeInfo(this.wildMonster?.status);
      this.enemyStatusBadge.setText(e.text);
      if (e.bg) this.enemyStatusBadge.setBackgroundColor(e.bg);
      this.enemyStatusBadge.setVisible(Boolean(e.text));
    }
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

    this.updateStatusBadges();
  }

  private executeTurn(playerMoveId: string) {
    if (this.isActing) return;
    this.isActing = true;
    this.movesContainer.setVisible(false);

    const activePlayer = this.playerParty[this.activePlayerIdx];
    const playerSpecies = getSpecies(activePlayer.speciesId);
    const enemySpecies = getSpecies(this.wildMonster.speciesId);

    const playerMove = MOVES[playerMoveId] || MOVES['tackle'];
    if (activePlayer.movePp) {
      activePlayer.movePp[playerMoveId] = Math.max(0, (activePlayer.movePp[playerMoveId] ?? playerMove.maxPp) - 1);
    }

    // Pick enemy move with available PP (or fallback to tackle)
    const enemyAvailableMoves = this.wildMonster.moves.filter(m => (this.wildMonster.movePp?.[m] ?? 1) > 0);
    const enemyMoveId = enemyAvailableMoves.length > 0 ? Phaser.Utils.Array.GetRandom(enemyAvailableMoves) : 'tackle';
    const enemyMove = MOVES[enemyMoveId] || MOVES['tackle'];
    if (this.wildMonster.movePp) {
      this.wildMonster.movePp[enemyMoveId] = Math.max(0, (this.wildMonster.movePp[enemyMoveId] ?? enemyMove.maxPp) - 1);
    }

    // Speed calculation with Paralysis speed halving
    let playerSpd = calculateStat(playerSpecies.baseStats.spd, activePlayer.level);
    if (activePlayer.status?.condition === 'paralysis') playerSpd = Math.floor(playerSpd * 0.5);

    let enemySpd = calculateStat(enemySpecies.baseStats.spd, this.wildMonster.level);
    if (this.wildMonster.status?.condition === 'paralysis') enemySpd = Math.floor(enemySpd * 0.5);

    const playerFirst = playerSpd >= enemySpd;
    const firstAttacker = playerFirst ? 'player' : 'enemy';

    this.runAttackStep(firstAttacker, playerMove, enemyMove, () => {
      // If opponent still alive, second step executes
      if (this.wildMonster.currentHp > 0 && activePlayer.currentHp > 0) {
        const secondAttacker = playerFirst ? 'enemy' : 'player';
        this.runAttackStep(secondAttacker, playerMove, enemyMove, () => {
          this.applyEndTurnResiduals();
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

    const isPlayer = attacker === 'player';
    const attackingMon = isPlayer ? activePlayer : this.wildMonster;
    const defendingMon = isPlayer ? this.wildMonster : activePlayer;
    const move = isPlayer ? playerMove : enemyMove;
    const sprite = isPlayer ? this.playerSprite : this.enemySprite;

    // Check status condition action prevention (Sleep, Freeze, Paralysis)
    const statusCheck = canAct(attackingMon.status);
    if (statusCheck.statusUpdate !== undefined) {
      attackingMon.status = statusCheck.statusUpdate;
      this.updateStatusBadges();
    }

    if (!statusCheck.canAct) {
      this.dialogueText.setText(`${attackingMon.nickname} ${statusCheck.reason}`);
      Sound.playHit(false);
      this.time.delayedCall(1200, next);
      return;
    }

    const ctx = {
      attackerLevel: attackingMon.level,
      attackerAtk: calculateStat(isPlayer ? playerSpecies.baseStats.atk : enemySpecies.baseStats.atk, attackingMon.level),
      attackerType: isPlayer ? playerSpecies.type : enemySpecies.type,
      attackerStatus: attackingMon.status,
      defenderDef: calculateStat(isPlayer ? enemySpecies.baseStats.def : playerSpecies.baseStats.def, defendingMon.level),
      defenderType: isPlayer ? enemySpecies.type : playerSpecies.type,
      move
    };

    const res = calculateDamage(ctx);
    let introText = statusCheck.reason ? `${attackingMon.nickname} ${statusCheck.reason} ` : '';
    introText += `${attackingMon.nickname} used ${move.name}!`;
    this.dialogueText.setText(introText);

    this.tweens.add({
      targets: sprite,
      x: isPlayer ? '+=20' : '-=20',
      duration: 90,
      yoyo: true,
      onComplete: () => {
        if (res.hit) {
          Sound.playHit(res.typeMultiplier > 1);
          defendingMon.currentHp = Math.max(0, defendingMon.currentHp - res.damage);
          this.cameras.main.shake(100, 0.005);
          this.updateHpBars();

          let note = '';
          if (res.typeMultiplier > 1.0) note = " It's super effective!";
          else if (res.typeMultiplier < 1.0) note = " It's not very effective...";

          // Roll status proc
          const newStatus = rollStatusProc(move, defendingMon.status);
          if (newStatus && defendingMon.currentHp > 0) {
            defendingMon.status = newStatus;
            this.updateStatusBadges();
            const condName = newStatus.condition === 'burn' ? 'burned'
              : newStatus.condition === 'poison' ? 'poisoned'
              : newStatus.condition === 'paralysis' ? 'paralyzed'
              : newStatus.condition === 'freeze' ? 'frozen solid'
              : 'put to sleep';
            note += ` ${defendingMon.nickname} was ${condName}!`;
          }

          this.dialogueText.setText(`${attackingMon.nickname} dealt ${res.damage} damage!${note}`);
        } else {
          this.dialogueText.setText(`${attackingMon.nickname}'s attack missed!`);
        }
        this.time.delayedCall(1100, next);
      }
    });
  }

  private applyEndTurnResiduals() {
    const activePlayer = this.playerParty[this.activePlayerIdx];

    const playerRes = calculateStatusResidual(activePlayer.status, activePlayer.maxHp);
    const enemyRes = calculateStatusResidual(this.wildMonster.status, this.wildMonster.maxHp);

    if (playerRes.damage > 0 || enemyRes.damage > 0) {
      if (playerRes.damage > 0 && activePlayer.currentHp > 0) {
        activePlayer.currentHp = Math.max(0, activePlayer.currentHp - playerRes.damage);
        this.updateHpBars();
        this.dialogueText.setText(`${activePlayer.nickname} ${playerRes.reason}`);
      }

      if (enemyRes.damage > 0 && this.wildMonster.currentHp > 0) {
        this.wildMonster.currentHp = Math.max(0, this.wildMonster.currentHp - enemyRes.damage);
        this.updateHpBars();
        if (playerRes.damage > 0) {
          this.time.delayedCall(1000, () => {
            this.dialogueText.setText(`${this.wildMonster.nickname} ${enemyRes.reason}`);
            this.time.delayedCall(1000, () => this.checkTurnEnd());
          });
          return;
        } else {
          this.dialogueText.setText(`${this.wildMonster.nickname} ${enemyRes.reason}`);
        }
      }
      this.time.delayedCall(1000, () => this.checkTurnEnd());
    } else {
      this.checkTurnEnd();
    }
  }

  private checkTurnEnd() {
    const activePlayer = this.playerParty[this.activePlayerIdx];

    if (this.wildMonster.currentHp <= 0) {
      // Enemy fainted
      Sound.playFaint();
      if (this.enemyBreathingTween) this.enemyBreathingTween.stop();
      if (this.enemyAura) {
        this.tweens.add({
          targets: this.enemyAura,
          alpha: 0,
          duration: 250,
          onComplete: () => {
            this.enemyAura?.destroy();
            this.enemyAura = undefined;
          }
        });
      }
      const wildSpecies = getSpecies(this.wildMonster.speciesId);
      const xpReward = calculateXpReward(wildSpecies.baseXp, this.wildMonster.level);
      this.dialogueText.setText(`${this.wildMonster.nickname} fainted! Won ${xpReward} XP!`);

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
        Sound.playLevelUp();
        const spec = getSpecies(activePlayer.speciesId);
        activePlayer.maxHp = calculateMaxHp(spec.baseStats.hp, activePlayer.level);
        activePlayer.currentHp = activePlayer.maxHp;

        this.time.delayedCall(1200, () => {
          this.dialogueText.setText(`${activePlayer.nickname} reached Level ${activePlayer.level}!`);
          this.checkEvolution(activePlayer, () => this.handleAfterEnemyFaint());
        });
      } else {
        this.time.delayedCall(1500, () => this.handleAfterEnemyFaint());
      }
    } else if (activePlayer.currentHp <= 0) {
      Sound.playFaint();
      if (this.playerBreathingTween) this.playerBreathingTween.stop();
      if (this.playerAura) {
        this.tweens.add({
          targets: this.playerAura,
          alpha: 0,
          duration: 250,
          onComplete: () => {
            this.playerAura?.destroy();
            this.playerAura = undefined;
          }
        });
      }
      this.dialogueText.setText(`${activePlayer.nickname} fainted!`);
      this.tweens.add({
        targets: this.playerSprite,
        alpha: 0,
        y: '+=20',
        duration: 400
      });

      // Check if player has other conscious monsters
      const hasAliveMon = this.playerParty.some(m => m.currentHp > 0);
      if (hasAliveMon) {
        this.time.delayedCall(1200, () => {
          this.dialogueText.setText('Choose another monster to send out!');
          this.showSwitchMenu(true);
        });
      } else {
        this.time.delayedCall(1500, () => {
          this.dialogueText.setText('You have no more conscious monsters! Blacked out...');
          this.time.delayedCall(1500, () => {
            // Revitalize party and return
            this.playerParty.forEach(m => (m.currentHp = m.maxHp));
            this.returnTile = { x: 10, y: 10 }; // Return to safe town Pallet Plaza
            this.endBattle(false);
          });
        });
      }
    } else {
      this.isActing = false;
      this.menuContainer.setVisible(true);
      this.dialogueText.setText(`What will ${activePlayer.nickname} do?`);
    }
  }

  private handleAfterEnemyFaint() {
    if (this.isTrainerBattle && this.trainerParty.length > 0) {
      // Check next trainer monster
      const nextAliveIdx = this.trainerParty.findIndex(m => m.currentHp > 0);
      if (nextAliveIdx !== -1) {
        this.activeTrainerIdx = nextAliveIdx;
        this.wildMonster = this.trainerParty[this.activeTrainerIdx];
        const nextSpecies = getSpecies(this.wildMonster.speciesId);

        this.dialogueText.setText(`${this.trainerName} sent out ${this.wildMonster.nickname}!`);
        this.enemySprite.setTexture(`monster-${nextSpecies.id}`);
        this.enemySprite.setAlpha(1);
        this.enemySprite.y = 95;
        this.enemyNameText.setText(`${this.wildMonster.nickname} Lv.${this.wildMonster.level}`);
        this.updateHpBars();
        this.updateEnemyVisuals(true);

        this.time.delayedCall(1400, () => {
          this.isActing = false;
          this.menuContainer.setVisible(true);
          const activePlayer = this.playerParty[this.activePlayerIdx];
          this.dialogueText.setText(`What will ${activePlayer.nickname} do?`);
        });
        return;
      } else {
        // Trainer defeated completely!
        Sound.playCatchSuccess();
        this.dialogueText.setText(`Congratulations! You defeated Master Aaron and became the Champion!`);
        try {
          localStorage.setItem('monster_proto_champion', '1');
        } catch {}
        this.time.delayedCall(2500, () => this.endBattle(true));
        return;
      }
    }

    this.endBattle(true);
  }

  private checkEvolution(playerMon: MonsterInstance, next: () => void) {
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
          Sound.playLevelUp();
          playerMon.speciesId = evoSpecies.id;
          playerMon.nickname = evoSpecies.name;
          playerMon.moves = getDefaultMoves(evoSpecies, playerMon.level);
          this.playerSprite.setTexture(`monster-${evoSpecies.id}`);
          this.updatePlayerVisuals(true);
          this.dialogueText.setText(`Congratulations! Evolved into ${evoSpecies.name}!`);
          this.time.delayedCall(2000, next);
        }
      });
    } else {
      next();
    }
  }

  private handleCatchAttempt(multiplier: number = 1.0) {
    const wildSpecies = getSpecies(this.wildMonster.speciesId);
    const hasStatus = Boolean(this.wildMonster.status);
    const baseChance = calculateCatchChance(wildSpecies.stage, this.wildMonster.currentHp, this.wildMonster.maxHp, hasStatus);
    const catchChance = Math.min(0.98, baseChance * multiplier);
    const roll = Math.random();

    this.dialogueText.setText(`Threw capsule at ${wildSpecies.name}...`);
    Sound.playWiggle();

    this.time.delayedCall(1000, () => {
      if (roll <= catchChance) {
        Sound.playCatchSuccess();
        this.dialogueText.setText(`Gotcha! ${wildSpecies.name} was successfully caught!`);
        this.tweens.add({
          targets: this.enemySprite,
          scale: 0,
          duration: 350
        });

        // Add to party
        if (this.playerParty.length < 6) {
          this.wildMonster.partySlot = this.playerParty.length;
          this.playerParty.push(this.wildMonster);
        }

        // Register in Dex
        try {
          const rawDex = localStorage.getItem('monster_proto_dex');
          const dex = rawDex ? JSON.parse(rawDex) : {};
          dex[wildSpecies.id] = true;
          localStorage.setItem('monster_proto_dex', JSON.stringify(dex));
        } catch {}

        this.time.delayedCall(1600, () => this.endBattle(true));
      } else {
        this.dialogueText.setText(`Oh no! ${wildSpecies.name} broke free!`);
        this.time.delayedCall(1000, () => {
          this.enemyRetaliateTurn();
        });
      }
    });
  }

  private handleRun() {
    if (this.isActing) return;
    this.isActing = true;
    this.menuContainer.setVisible(false);

    if (this.isTrainerBattle) {
      this.dialogueText.setText(`You cannot run away from a Champion battle!`);
      this.time.delayedCall(1200, () => {
        this.isActing = false;
        this.menuContainer.setVisible(true);
      });
      return;
    }

    this.dialogueText.setText('Got away safely!');
    this.time.delayedCall(800, () => this.endBattle(true));
  }

  private endBattle(survived: boolean) {
    this.isActing = false;
    try {
      localStorage.setItem('monster_proto_party', JSON.stringify(this.playerParty));
    } catch {}

    this.scene.start(this.returnScene, {
      returnTile: this.returnTile,
      justExitedBattle: true
    });
  }

  public refreshPartyHp() {
    this.playerParty.forEach((m) => {
      m.currentHp = m.maxHp;
    });
    this.updateHpBars();
    Sound.playRevitalize();
    if (this.dialogueText && this.dialogueText.active) {
      this.dialogueText.setText('💖 Team Revitalized to Full HP!');
    }
  }

  private updatePlayerVisuals(burst = false) {
    const activePlayer = this.playerParty[this.activePlayerIdx];
    const playerSpecies = getSpecies(activePlayer.speciesId);

    // Stop existing breathing tween and reset base scale
    if (this.playerBreathingTween) {
      this.playerBreathingTween.stop();
    }
    this.playerSprite.setScale(1.4);

    // Start idle organic breathing tween
    this.playerBreathingTween = this.tweens.add({
      targets: this.playerSprite,
      scaleY: 1.4 * 1.05,
      scaleX: 1.4 * 0.97,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Clean up previous aura
    if (this.playerAuraTween) {
      this.playerAuraTween.stop();
    }
    if (this.playerAura) {
      this.playerAura.destroy();
      this.playerAura = undefined;
    }

    // Stage 3 monsters get glowing radiant elemental aura
    if (playerSpecies.stage === 3) {
      const col = TYPE_AURA_COLORS[playerSpecies.type] || 0xf59e0b;
      this.playerAura = this.add.circle(120, 195, 48, col, 0.3)
        .setStrokeStyle(3, col, 0.8)
        .setDepth(this.playerSprite.depth - 1);

      this.playerAuraTween = this.tweens.add({
        targets: this.playerAura,
        scale: 1.25,
        alpha: 0.12,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Capsule pop summon effect
    if (burst) {
      this.triggerCapsulePop(120, 195);
    }
  }

  private updateEnemyVisuals(burst = false) {
    const enemySpecies = getSpecies(this.wildMonster.speciesId);

    // Stop existing breathing tween and reset base scale
    if (this.enemyBreathingTween) {
      this.enemyBreathingTween.stop();
    }
    this.enemySprite.setScale(1.2);

    // Start idle organic breathing tween
    this.enemyBreathingTween = this.tweens.add({
      targets: this.enemySprite,
      scaleY: 1.2 * 1.05,
      scaleX: 1.2 * 0.97,
      duration: 920,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Clean up previous aura
    if (this.enemyAuraTween) {
      this.enemyAuraTween.stop();
    }
    if (this.enemyAura) {
      this.enemyAura.destroy();
      this.enemyAura = undefined;
    }

    // Stage 3 monsters or Champion trainer monsters get glowing radiant aura
    if (enemySpecies.stage === 3 || this.isTrainerBattle) {
      const col = TYPE_AURA_COLORS[enemySpecies.type] || 0xf59e0b;
      this.enemyAura = this.add.circle(360, 95, 42, col, 0.3)
        .setStrokeStyle(3, col, 0.8)
        .setDepth(this.enemySprite.depth - 1);

      this.enemyAuraTween = this.tweens.add({
        targets: this.enemyAura,
        scale: 1.28,
        alpha: 0.12,
        duration: 850,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Capsule pop summon effect
    if (burst) {
      this.triggerCapsulePop(360, 95);
    }
  }

  private triggerCapsulePop(x: number, y: number) {
    const flash = this.add.circle(x, y, 12, 0xffffff, 0.9).setDepth(30);
    this.tweens.add({
      targets: flash,
      scale: 3.5,
      alpha: 0,
      duration: 320,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy()
    });
  }
}

const TYPE_AURA_COLORS: Record<string, number> = {
  Fire: 0xf97316,
  Water: 0x06b6d4,
  Grass: 0x22c55e,
  Psy: 0xa855f7,
  Dark: 0x64748b,
  Dragon: 0x8b5cf6,
  Fly: 0x38bdf8,
  Fight: 0xf59e0b
};
