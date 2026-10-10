import Phaser from 'phaser';
import { SPECIES, MonsterInstance, getSpecies, calculateMaxHp } from '@monster-proto/shared';

export interface PartySceneData {
  party: MonsterInstance[];
  dex: Record<string, boolean>;
  returnScene: string;
}

export class PartyScene extends Phaser.Scene {
  private party: MonsterInstance[] = [];
  private dex: Record<string, boolean> = {};
  private returnScene = 'OverworldScene';
  private currentTab: 'party' | 'dex' = 'party';

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
    const partyTab = this.add.text(120, 25, '👥 My Party', {
      fontSize: '15px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.currentTab = 'party';
      this.renderContent();
    });

    const dexTab = this.add.text(260, 25, '📖 Pokedex', {
      fontSize: '15px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.currentTab = 'dex';
      this.renderContent();
    });

    // Close button
    this.add.text(430, 25, '✖ Close', {
      fontSize: '12px',
      color: '#ef4444'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.scene.stop('PartyScene');
      this.scene.resume(this.returnScene);
    });

    this.renderContent();
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

      // Card container
      this.add.rectangle(x, y, 210, 65, 0x1e293b).setStrokeStyle(1, 0x475569).setName('tab-content');
      this.add.image(x - 65, y, `monster-${spec.id}`).setScale(0.85).setName('tab-content');

      this.add.text(x - 25, y - 22, `${mon.nickname}`, {
        fontSize: '12px',
        color: '#fff',
        fontStyle: 'bold'
      }).setName('tab-content');

      this.add.text(x - 25, y - 8, `Lv.${mon.level} (${spec.type})`, {
        fontSize: '10px',
        color: '#38bdf8'
      }).setName('tab-content');

      this.add.text(x - 25, y + 6, `HP: ${mon.currentHp}/${mon.maxHp}`, {
        fontSize: '10px',
        color: '#4ade80'
      }).setName('tab-content');

      this.add.text(x - 25, y + 18, `Moves: ${mon.moves.join(', ')}`, {
        fontSize: '8px',
        color: '#cbd5e1'
      }).setName('tab-content');
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
