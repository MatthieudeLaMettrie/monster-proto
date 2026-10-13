import Phaser from 'phaser';
import {
  MonsterInstance,
  getSpecies,
  calculateStat,
  canDepositMonster,
  canWithdrawMonster,
  depositMonster,
  withdrawMonster,
  swapPartyAndBoxMonsters,
  renameMonster,
  BOX_METADATA,
  BOX_CAPACITY,
  TOTAL_BOXES,
  getBoxMetadata
} from '@monster-proto/shared';
import { Sound } from './SoundManager.js';

export interface BoxSceneData {
  returnScene?: string;
  preferredBox?: number;
}

export class BoxScene extends Phaser.Scene {
  private party: MonsterInstance[] = [];
  private boxMonsters: MonsterInstance[] = [];
  private currentBox: number = 1;
  private returnScene: string = 'OverworldScene';

  private selectedMonster: {
    mon: MonsterInstance;
    source: 'party' | 'box';
    index: number;
  } | null = null;

  private boxTitleText!: Phaser.GameObjects.Text;
  private boxHeaderBg!: Phaser.GameObjects.Rectangle;
  private modalContainer?: Phaser.GameObjects.Container;

  constructor() {
    super('BoxScene');
  }

  init(data?: BoxSceneData) {
    this.returnScene = data?.returnScene || 'OverworldScene';
    this.currentBox = data?.preferredBox || 1;
    this.selectedMonster = null;
    this.loadState();
  }

  private loadState() {
    try {
      const rawParty = localStorage.getItem('monster_proto_party');
      this.party = rawParty ? JSON.parse(rawParty) : [];
    } catch {
      this.party = [];
    }

    try {
      const rawBox = localStorage.getItem('monster_proto_box');
      this.boxMonsters = rawBox ? JSON.parse(rawBox) : [];
    } catch {
      this.boxMonsters = [];
    }
  }

  private saveState() {
    try {
      localStorage.setItem('monster_proto_party', JSON.stringify(this.party));
      localStorage.setItem('monster_proto_box', JSON.stringify(this.boxMonsters));
    } catch {}
  }

  create() {
    // Backdrop
    this.add.rectangle(240, 160, 480, 320, 0x090d16);

    // Top Navigation Header
    this.add.rectangle(240, 18, 480, 36, 0x0f172a).setStrokeStyle(1, 0x334155);

    this.add.text(12, 18, '💻 PC Storage System', {
      fontSize: '11px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Box navigation switcher
    const prevBtn = this.add.text(150, 18, '◀ Prev', {
      fontSize: '10px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.currentBox = this.currentBox === 1 ? TOTAL_BOXES : this.currentBox - 1;
      this.selectedMonster = null;
      this.renderAll();
    });

    this.boxHeaderBg = this.add.rectangle(250, 18, 150, 22, 0x166534, 0.85).setStrokeStyle(1, 0x4ade80);
    this.boxTitleText = this.add.text(250, 18, '', {
      fontSize: '9.5px',
      color: '#f8fafc',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const nextBtn = this.add.text(350, 18, 'Next ▶', {
      fontSize: '10px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.currentBox = this.currentBox === TOTAL_BOXES ? 1 : this.currentBox + 1;
      this.selectedMonster = null;
      this.renderAll();
    });

    // Exit Button
    this.add.text(440, 18, '✖ Exit PC', {
      fontSize: '10px',
      color: '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      Sound.playWiggle();
      this.scene.stop('BoxScene');
      if (this.scene.isPaused(this.returnScene)) {
        this.scene.resume(this.returnScene);
      } else {
        this.scene.start(this.returnScene);
      }
    });

    this.renderAll();
  }

  private renderAll() {
    // Clear dynamic elements
    const children = this.children.getChildren();
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child.name === 'dynamic-content') {
        child.destroy();
      }
    }

    if (this.modalContainer) {
      this.modalContainer.destroy();
      this.modalContainer = undefined;
    }

    const meta = getBoxMetadata(this.currentBox);
    const inThisBox = this.boxMonsters.filter(m => (m.boxNumber || 1) === this.currentBox);

    this.boxHeaderBg.setFillStyle(meta.themeColor, 0.9);
    this.boxTitleText.setText(`${meta.name} (${inThisBox.length}/${BOX_CAPACITY})`);

    this.renderPartyColumn();
    this.renderStorageBoxGrid();
    if (this.selectedMonster) {
      this.renderSelectedInspector();
    }
  }

  // --- Left Column: Active Party ---
  private renderPartyColumn() {
    this.add.text(88, 45, `👥 Active Party (${this.party.length}/6)`, {
      fontSize: '10px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setName('dynamic-content');

    const startY = 65;
    const slotH = 38;

    for (let i = 0; i < 6; i++) {
      const mon = this.party[i];
      const y = startY + i * slotH;
      const isSelected = this.selectedMonster?.source === 'party' && this.selectedMonster?.index === i;

      if (mon) {
        const spec = getSpecies(mon.speciesId);
        const cardBg = this.add.rectangle(88, y, 160, 34, isSelected ? 0x1e3a8a : 0x1e293b)
          .setStrokeStyle(isSelected ? 2 : 1, isSelected ? 0x60a5fa : 0x475569)
          .setName('dynamic-content')
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
            this.handlePartyCardClick(i);
          });

        this.add.image(26, y, `monster-${spec.id}`).setScale(0.55).setName('dynamic-content');

        const hpRatio = mon.maxHp > 0 ? mon.currentHp / mon.maxHp : 1;
        const hpColor = hpRatio > 0.5 ? '#4ade80' : hpRatio > 0.2 ? '#facc15' : '#ef4444';

        this.add.text(48, y - 9, `${mon.nickname} Lv.${mon.level}`, {
          fontSize: '9.5px',
          color: isSelected ? '#93c5fd' : '#f8fafc',
          fontStyle: 'bold'
        }).setName('dynamic-content');

        this.add.text(48, y + 4, `HP: ${mon.currentHp}/${mon.maxHp} (${spec.type})`, {
          fontSize: '7.5px',
          color: hpColor
        }).setName('dynamic-content');

        if (i === 0) {
          this.add.text(160, y - 9, '★', { fontSize: '8px', color: '#f59e0b' }).setOrigin(1, 0).setName('dynamic-content');
        }
      } else {
        // Empty party slot
        this.add.rectangle(88, y, 160, 34, 0x0f172a)
          .setStrokeStyle(1, 0x334155)
          .setName('dynamic-content');

        this.add.text(88, y, `Slot ${i + 1} (Empty)`, {
          fontSize: '8.5px',
          color: '#475569'
        }).setOrigin(0.5).setName('dynamic-content');
      }
    }
  }

  // --- Right Panel: 30-Slot Storage Box Grid ---
  private renderStorageBoxGrid() {
    const meta = getBoxMetadata(this.currentBox);

    // Box velvet backdrop
    this.add.rectangle(320, 175, 290, 240, 0x0f172a)
      .setStrokeStyle(2, meta.themeColor)
      .setName('dynamic-content');

    this.add.rectangle(320, 175, 284, 234, meta.themeColor, 0.22)
      .setName('dynamic-content');

    const inBox = this.boxMonsters.filter(m => (m.boxNumber || 1) === this.currentBox);
    const slotMap = new Map<number, MonsterInstance>();
    inBox.forEach(m => {
      slotMap.set(m.boxSlot ?? -1, m);
    });

    const cols = 5;
    const rows = 6;
    const startX = 202;
    const startY = 75;
    const cellW = 55;
    const cellH = 37;

    for (let slot = 0; slot < BOX_CAPACITY; slot++) {
      const col = slot % cols;
      const row = Math.floor(slot / cols);
      const x = startX + col * cellW;
      const y = startY + row * cellH;

      const mon = slotMap.get(slot);
      const isSelected = this.selectedMonster?.source === 'box' && this.selectedMonster?.mon.id === mon?.id;

      if (mon) {
        const spec = getSpecies(mon.speciesId);

        this.add.rectangle(x, y, 48, 32, isSelected ? 0x1e3a8a : 0x1e293b)
          .setStrokeStyle(isSelected ? 2 : 1, isSelected ? 0x60a5fa : 0x475569)
          .setName('dynamic-content')
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
            this.handleBoxSlotClick(mon);
          });

        this.add.image(x - 10, y, `monster-${spec.id}`).setScale(0.5).setName('dynamic-content');

        this.add.text(x + 12, y - 6, `Lv.${mon.level}`, {
          fontSize: '7.5px',
          color: '#f8fafc',
          fontStyle: 'bold'
        }).setOrigin(0.5).setName('dynamic-content');

        this.add.text(x + 12, y + 6, `#${spec.id}`, {
          fontSize: '6.5px',
          color: '#94a3b8'
        }).setOrigin(0.5).setName('dynamic-content');
      } else {
        // Empty slot
        const cell = this.add.rectangle(x, y, 48, 32, 0x111827, 0.6)
          .setStrokeStyle(1, 0x1f2937)
          .setName('dynamic-content');

        this.add.text(x, y, `${slot + 1}`, {
          fontSize: '7px',
          color: '#374151'
        }).setOrigin(0.5).setName('dynamic-content');

        // If player has a party monster selected, clicking empty slot deposits directly there
        if (this.selectedMonster?.source === 'party') {
          cell.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
            this.depositSelectedToSlot(slot);
          });
        }
      }
    }
  }

  // --- Interaction Handlers ---
  private handlePartyCardClick(idx: number) {
    const mon = this.party[idx];
    if (!mon) return;

    if (this.selectedMonster?.source === 'box') {
      // Direct swap box monster with this party monster
      this.executeSwap(mon.id, this.selectedMonster.mon.id);
      return;
    }

    if (this.selectedMonster?.source === 'party' && this.selectedMonster.index === idx) {
      // Deselect
      this.selectedMonster = null;
    } else {
      Sound.playWiggle();
      this.selectedMonster = { mon, source: 'party', index: idx };
    }
    this.renderAll();
  }

  private handleBoxSlotClick(mon: MonsterInstance) {
    if (this.selectedMonster?.source === 'party') {
      // Direct swap party monster with this box monster
      this.executeSwap(this.selectedMonster.mon.id, mon.id);
      return;
    }

    if (this.selectedMonster?.source === 'box' && this.selectedMonster.mon.id === mon.id) {
      // Deselect
      this.selectedMonster = null;
    } else {
      Sound.playWiggle();
      const inBoxIdx = this.boxMonsters.findIndex(m => m.id === mon.id);
      this.selectedMonster = { mon, source: 'box', index: inBoxIdx };
    }
    this.renderAll();
  }

  private executeSwap(partyMonId: string, boxMonId: string) {
    const res = swapPartyAndBoxMonsters(this.party, this.boxMonsters, partyMonId, boxMonId);
    if (!res.success) {
      this.showToast(res.reason || 'Swap failed!', true);
      return;
    }

    this.party = res.party;
    this.boxMonsters = res.boxMonsters;
    this.selectedMonster = null;
    this.saveState();
    Sound.playRevitalize();
    this.showToast('🔄 Monsters swapped successfully!');
    this.renderAll();
  }

  private depositSelectedToSlot(targetSlot: number) {
    if (!this.selectedMonster || this.selectedMonster.source !== 'party') return;

    const check = canDepositMonster(this.party, this.selectedMonster.mon.id);
    if (!check.canDeposit) {
      this.showToast(check.reason || 'Cannot deposit!', true);
      return;
    }

    const idx = this.party.findIndex(m => m.id === this.selectedMonster!.mon.id);
    const [mon] = this.party.splice(idx, 1);
    this.party.forEach((m, i) => (m.partySlot = i));

    mon.partySlot = null;
    mon.boxNumber = this.currentBox;
    mon.boxSlot = targetSlot;
    this.boxMonsters.push(mon);

    this.selectedMonster = null;
    this.saveState();
    Sound.playCatchSuccess();
    this.showToast(`⬇ Deposited ${mon.nickname} into Box ${this.currentBox}!`);
    this.renderAll();
  }

  // --- Inspector & Action Modal ---
  private renderSelectedInspector() {
    if (!this.selectedMonster) return;
    const { mon, source } = this.selectedMonster;
    const spec = getSpecies(mon.speciesId);

    // Inspector container at bottom
    this.modalContainer = this.add.container(240, 160).setDepth(200);

    const bg = this.add.rectangle(0, 0, 360, 220, 0x0f172a, 0.98)
      .setStrokeStyle(2, source === 'party' ? 0x38bdf8 : 0x10b981);

    // Close button
    const closeBtn = this.add.text(165, -95, '✖', { fontSize: '13px', color: '#ef4444' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        this.selectedMonster = null;
        this.renderAll();
      });

    // Monster Sprite
    const spr = this.add.image(-110, -35, `monster-${spec.id}`).setScale(1.2);
    this.tweens.add({
      targets: spr,
      y: '-=4',
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Details Text
    const title = this.add.text(-40, -85, `${mon.nickname} (Species: ${spec.name})`, {
      fontSize: '12px',
      color: '#f8fafc',
      fontStyle: 'bold'
    });

    const sub = this.add.text(-40, -68, `Lv.${mon.level} • ${spec.type} Type • Stage ${spec.stage}`, {
      fontSize: '9px',
      color: '#94a3b8'
    });

    const atk = calculateStat(spec.baseStats.atk, mon.level);
    const def = calculateStat(spec.baseStats.def, mon.level);
    const spd = calculateStat(spec.baseStats.spd, mon.level);

    const stats = this.add.text(-40, -48, `HP: ${mon.currentHp}/${mon.maxHp}  |  ATK: ${atk}  DEF: def  SPD: ${spd}`, {
      fontSize: '8.5px',
      color: '#4ade80'
    });

    // Moves display
    const movesTitle = this.add.text(-40, -28, 'Learned Moves:', {
      fontSize: '8.5px',
      color: '#cbd5e1',
      fontStyle: 'bold'
    });

    const movesList = this.add.text(-40, -14, mon.moves.join(' • '), {
      fontSize: '8px',
      color: '#38bdf8'
    });

    const locationText = this.add.text(
      -40,
      4,
      source === 'party'
        ? `Location: Active Party (Slot ${(mon.partySlot ?? 0) + 1})`
        : `Location: PC Box ${mon.boxNumber || 1} (Slot ${(mon.boxSlot ?? 0) + 1})`,
      { fontSize: '8px', color: '#e2e8f0' }
    );

    // --- Action Buttons ---
    const buttons: (Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text)[] = [];

    if (source === 'party') {
      // Deposit Button
      const depBtn = this.add.rectangle(-80, 65, 110, 26, 0x0284c7)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          const res = depositMonster(this.party, this.boxMonsters, mon.id, this.currentBox);
          if (!res.success) {
            this.showToast(res.reason || 'Deposit failed!', true);
            return;
          }
          this.party = res.party;
          this.boxMonsters = res.boxMonsters;
          this.selectedMonster = null;
          this.saveState();
          Sound.playCatchSuccess();
          this.showToast(`⬇ Deposited ${mon.nickname} into PC Box ${this.currentBox}!`);
          this.renderAll();
        });

      const depTxt = this.add.text(-80, 65, '⬇ Deposit to Box', {
        fontSize: '9.5px',
        color: '#fff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      buttons.push(depBtn, depTxt);
    } else {
      // Withdraw Button
      const wBtn = this.add.rectangle(-80, 65, 110, 26, 0x16a34a)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          const res = withdrawMonster(this.party, this.boxMonsters, mon.id);
          if (!res.success) {
            this.showToast(res.reason || 'Withdraw failed!', true);
            return;
          }
          this.party = res.party;
          this.boxMonsters = res.boxMonsters;
          this.selectedMonster = null;
          this.saveState();
          Sound.playRevitalize();
          this.showToast(`⬆ Withdrew ${mon.nickname} into Active Party!`);
          this.renderAll();
        });

      const wTxt = this.add.text(-80, 65, '⬆ Withdraw to Party', {
        fontSize: '9.5px',
        color: '#fff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      buttons.push(wBtn, wTxt);
    }

    // Rename Button
    const renBtn = this.add.rectangle(45, 65, 80, 26, 0x475569)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.promptRename(mon);
      });

    const renTxt = this.add.text(45, 65, '✏️ Rename', {
      fontSize: '9.5px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    buttons.push(renBtn, renTxt);

    // Release Button (Box monsters only, safety gate)
    if (source === 'box') {
      const relBtn = this.add.rectangle(130, 65, 60, 26, 0x991b1b)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.confirmRelease(mon);
        });

      const relTxt = this.add.text(130, 65, '🗑️ Release', {
        fontSize: '8.5px',
        color: '#fff'
      }).setOrigin(0.5);
      buttons.push(relBtn, relTxt);
    }

    this.modalContainer.add([
      bg,
      closeBtn,
      spr,
      title,
      sub,
      stats,
      movesTitle,
      movesList,
      locationText,
      ...buttons
    ]);
  }

  private promptRename(mon: MonsterInstance) {
    const entered = window.prompt(`Enter new nickname for ${mon.nickname}:`, mon.nickname);
    if (entered !== null) {
      const trimmed = entered.trim();
      if (trimmed.length > 0 && trimmed.length <= 20) {
        mon.nickname = trimmed;
        this.saveState();
        Sound.playLevelUp();
        this.showToast(`✏️ Renamed to "${trimmed}"!`);
        this.renderAll();
      } else {
        this.showToast('Nickname must be between 1 and 20 characters.', true);
      }
    }
  }

  private confirmRelease(mon: MonsterInstance) {
    const ok = window.confirm(`Are you sure you want to release ${mon.nickname} into the wild? This cannot be undone!`);
    if (ok) {
      const idx = this.boxMonsters.findIndex(m => m.id === mon.id);
      if (idx !== -1) {
        this.boxMonsters.splice(idx, 1);
        this.selectedMonster = null;
        this.saveState();
        Sound.playWiggle();
        this.showToast(`Released ${mon.nickname} into the wild.`);
        this.renderAll();
      }
    }
  }

  private showToast(msg: string, isError = false) {
    const toast = document.getElementById('save-toast');
    if (toast) {
      toast.innerText = msg;
      toast.style.background = isError ? '#ef4444' : '#10b981';
      toast.style.opacity = '1';
      setTimeout(() => (toast.style.opacity = '0'), 2000);
    }
  }
}
