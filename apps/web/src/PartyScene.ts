import Phaser from 'phaser';
import {
  SPECIES,
  MonsterInstance,
  getSpecies,
  calculateMaxHp,
  ITEMS,
  DEFAULT_INVENTORY,
  InventoryBag
} from '@monster-proto/shared';

export interface PartySceneData {
  party: MonsterInstance[];
  dex: Record<string, boolean>;
  returnScene: string;
}

export class PartyScene extends Phaser.Scene {
  private party: MonsterInstance[] = [];
  private dex: Record<string, boolean> = {};
  private returnScene = 'OverworldScene';
  private currentTab: 'party' | 'bag' | 'dex' = 'party';

  private tabTexts: Record<string, Phaser.GameObjects.Text> = {};

  constructor() {
    super('PartyScene');
  }

  init(data: PartySceneData) {
    this.party = data.party || [];
    this.dex = data.dex || {};
    this.returnScene = data.returnScene || 'OverworldScene';
  }

  create() {
    // Backdrop
    this.add.rectangle(240, 160, 480, 320, 0x0f172a);

    // Header tabs
    this.tabTexts['party'] = this.add.text(90, 25, '👥 Party', {
      fontSize: '13px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.currentTab = 'party';
      this.updateTabStyles();
      this.renderContent();
    });

    this.tabTexts['bag'] = this.add.text(190, 25, '🎒 Bag', {
      fontSize: '13px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.currentTab = 'bag';
      this.updateTabStyles();
      this.renderContent();
    });

    this.tabTexts['dex'] = this.add.text(290, 25, '📖 Pokedex', {
      fontSize: '13px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.currentTab = 'dex';
      this.updateTabStyles();
      this.renderContent();
    });

    // Close button
    this.add.text(430, 25, '✖ Close', {
      fontSize: '12px',
      color: '#ef4444'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.scene.stop('PartyScene');
      if (this.scene.isPaused(this.returnScene)) {
        this.scene.resume(this.returnScene);
      } else {
        this.scene.start(this.returnScene);
      }
    });

    this.updateTabStyles();
    this.renderContent();
  }

  private updateTabStyles() {
    Object.keys(this.tabTexts).forEach(tab => {
      const active = tab === this.currentTab;
      this.tabTexts[tab].setColor(active ? '#38bdf8' : '#94a3b8');
    });
  }

  private renderContent() {
    // Clear previous items
    const children = this.children.getChildren();
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child.name === 'tab-content') {
        child.destroy();
      }
    }

    if (this.currentTab === 'party') {
      this.renderParty();
    } else if (this.currentTab === 'bag') {
      this.renderBag();
    } else {
      this.renderDex();
    }
  }

  private renderParty() {
    if (this.party.length === 0) {
      this.add.text(240, 150, 'No monsters in party yet!', {
        fontSize: '14px',
        color: '#94a3b8'
      }).setOrigin(0.5).setName('tab-content');
      return;
    }

    this.party.forEach((mon, i) => {
      const spec = getSpecies(mon.speciesId);
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 125 + col * 230;
      const y = 85 + row * 75;

      const isLeader = i === 0;

      // Card container
      this.add.rectangle(x, y, 210, 65, isLeader ? 0x1e294b : 0x1e293b)
        .setStrokeStyle(1, isLeader ? 0x38bdf8 : 0x475569)
        .setName('tab-content');

      this.add.image(x - 65, y, `monster-${spec.id}`).setScale(0.85).setName('tab-content');

      this.add.text(x - 25, y - 22, `${mon.nickname} ${isLeader ? '★ LEAD' : ''}`, {
        fontSize: '11px',
        color: isLeader ? '#38bdf8' : '#fff',
        fontStyle: 'bold'
      }).setName('tab-content');

      this.add.text(x - 25, y - 8, `Lv.${mon.level} (${spec.type})`, {
        fontSize: '10px',
        color: '#94a3b8'
      }).setName('tab-content');

      const atk = Math.floor((spec.baseStats.atk * 2 * mon.level) / 100) + 5;
      const def = Math.floor((spec.baseStats.def * 2 * mon.level) / 100) + 5;
      const spd = Math.floor((spec.baseStats.spd * 2 * mon.level) / 100) + 5;

      this.add.text(x - 25, y + 6, `HP:${mon.currentHp}/${mon.maxHp} ATK:${atk} DEF:${def} SPD:${spd}`, {
        fontSize: '8px',
        color: '#4ade80'
      }).setName('tab-content');

      // Make Lead button (if not already lead)
      if (!isLeader) {
        const leadBtn = this.add.rectangle(x + 72, y - 18, 52, 16, 0x0284c7)
          .setInteractive({ useHandCursor: true })
          .setName('tab-content')
          .on('pointerdown', () => this.setPartyLeader(i));

        const leadTxt = this.add.text(x + 72, y - 18, '★ Lead', {
          fontSize: '8px',
          color: '#fff',
          fontStyle: 'bold'
        }).setOrigin(0.5).setName('tab-content');
      }
    });
  }

  private setPartyLeader(idx: number) {
    if (idx <= 0 || idx >= this.party.length) return;
    const selected = this.party.splice(idx, 1)[0];
    this.party.unshift(selected);

    // Update slots and save
    this.party.forEach((m, i) => (m.partySlot = i));
    try {
      localStorage.setItem('monster_proto_party', JSON.stringify(this.party));
    } catch {}

    this.renderContent();
  }

  private renderBag() {
    const rawInv = localStorage.getItem('monster_proto_inventory');
    const inv: InventoryBag = rawInv ? { ...DEFAULT_INVENTORY, ...JSON.parse(rawInv) } : { ...DEFAULT_INVENTORY };

    this.add.text(240, 50, '🎒 Trainer Inventory', {
      fontSize: '13px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setName('tab-content');

    const itemKeys = Object.keys(ITEMS);
    itemKeys.forEach((key, idx) => {
      const item = ITEMS[key];
      const count = inv[key] || 0;

      const y = 80 + idx * 40;

      const card = this.add.rectangle(240, y, 420, 32, 0x1e293b)
        .setStrokeStyle(1, 0x475569)
        .setName('tab-content');

      this.add.text(50, y, item.name, {
        fontSize: '11px',
        color: '#f8fafc',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5).setName('tab-content');

      this.add.text(200, y, item.description, {
        fontSize: '9px',
        color: '#94a3b8'
      }).setOrigin(0, 0.5).setName('tab-content');

      this.add.text(410, y, `x${count}`, {
        fontSize: '11px',
        color: count > 0 ? '#4ade80' : '#ef4444',
        fontStyle: 'bold'
      }).setOrigin(1, 0.5).setName('tab-content');
    });
  }

  private renderDex() {
    let caughtCount = 0;
    SPECIES.forEach((s) => {
      if (this.dex[s.id]) caughtCount++;
    });

    this.add.text(240, 55, `Caught: ${caughtCount} / 60 Species`, {
      fontSize: '12px',
      color: '#4ade80',
      fontStyle: 'bold'
    }).setOrigin(0.5).setName('tab-content');

    // Mini scroll grid
    const cols = 6;
    const startX = 65;
    const startY = 85;
    const cellW = 70;
    const cellH = 36;

    // Show first 24 entries
    SPECIES.slice(0, 24).forEach((s, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = startX + col * cellW;
      const y = startY + row * cellH;

      const caught = this.dex[s.id];
      const bg = this.add.rectangle(x, y, 64, 30, caught ? 0x166534 : 0x334155).setName('tab-content');

      this.add.text(x, y, `#${s.id} ${caught ? s.name : '???'}`, {
        fontSize: '8px',
        color: caught ? '#fff' : '#94a3b8'
      }).setOrigin(0.5).setName('tab-content');
    });
  }
}
