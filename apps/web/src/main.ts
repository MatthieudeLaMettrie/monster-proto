import Phaser from 'phaser';
import { GalleryScene } from './GalleryScene.js';
import { OverworldScene } from './OverworldScene.js';
import { BattleScene } from './BattleScene.js';
import { PartyScene } from './PartyScene.js';
import { StarterSelectScene } from './StarterSelectScene.js';
import { PersistenceManager } from './persistence.js';

import { SPECIES } from '@monster-proto/shared';

class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.json('worldMap', '/map.json');
    // Preload all 60 monster SVGs upfront so battles and party scene never crash
    for (const s of SPECIES) {
      this.load.svg(`monster-${s.id}`, `/sprites/${s.id}.svg`, { width: 64, height: 64 });
    }
  }

  async create() {
    // Authenticate guest session
    await PersistenceManager.initSession();

    this.add.text(240, 45, 'Monster Proto', {
      fontSize: '28px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(240, 75, '2D Browser Monster Battle Prototype', {
      fontSize: '13px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    // Play button -> checks if starter picked
    const playBtn = this.add.rectangle(240, 135, 220, 38, 0x10b981)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const rawParty = localStorage.getItem('monster_proto_party');
        let hasParty = false;
        if (rawParty) {
          try {
            const parsed = JSON.parse(rawParty);
            if (Array.isArray(parsed) && parsed.length > 0) hasParty = true;
          } catch {}
        }
        if (!hasParty) {
          this.scene.start('StarterSelectScene');
        } else {
          this.scene.start('OverworldScene');
        }
      });

    this.add.text(240, 135, '▶ Start Adventure (Map)', {
      fontSize: '14px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Pick Starter button
    const starterBtn = this.add.rectangle(240, 185, 220, 38, 0xf59e0b)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('StarterSelectScene');
      });

    this.add.text(240, 185, '🐾 Pick / Reset Starter', {
      fontSize: '14px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Gallery button
    const galleryBtn = this.add.rectangle(240, 235, 220, 38, 0x3b82f6)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('GalleryScene');
      });

    this.add.text(240, 235, '📜 View 60 Monsters', {
      fontSize: '14px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const statusText = this.add.text(240, 275, 'Connecting to Cloudflare API...', {
      fontSize: '12px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        statusText.setText(`Server Connected: ${data.game}`);
        statusText.setColor('#06d6a0');
      })
      .catch(() => {
        statusText.setText('Running offline local mode');
      });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 480,
  height: 320,
  parent: 'game-container',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, StarterSelectScene, OverworldScene, BattleScene, PartyScene, GalleryScene]
};

const game = new Phaser.Game(config);

// Wire persistent HTML Top Navigation Bar buttons
window.addEventListener('DOMContentLoaded', () => {
  const partyBtn = document.getElementById('btn-party');
  const healBtn = document.getElementById('btn-heal');
  const saveBtn = document.getElementById('btn-save');

  partyBtn?.addEventListener('click', () => {
    const rawParty = localStorage.getItem('monster_proto_party');
    const rawDex = localStorage.getItem('monster_proto_dex');
    let party: any[] = [];
    if (rawParty) {
      try {
        const parsed = JSON.parse(rawParty);
        if (Array.isArray(parsed) && parsed.length > 0) party = parsed;
      } catch {}
    }
    const dex = rawDex ? JSON.parse(rawDex) : { 1: true };

    const overworld = game.scene.getScene('OverworldScene') as OverworldScene;
    if (overworld && game.scene.isActive('OverworldScene')) {
      overworld.openPartyMenu();
    } else if (game.scene.isActive('BattleScene')) {
      game.scene.pause('BattleScene');
      game.scene.launch('PartyScene', { party, dex, returnScene: 'BattleScene' });
    } else {
      game.scene.start('PartyScene', { party, dex, returnScene: 'OverworldScene' });
    }
  });

  healBtn?.addEventListener('click', () => {
    const raw = localStorage.getItem('monster_proto_party');
    if (raw) {
      try {
        const party = JSON.parse(raw);
        if (Array.isArray(party)) {
          party.forEach((m: any) => (m.currentHp = m.maxHp));
          localStorage.setItem('monster_proto_party', JSON.stringify(party));
        }
      } catch {}
    }

    const overworld = game.scene.getScene('OverworldScene') as OverworldScene;
    const battle = game.scene.getScene('BattleScene') as any;

    if (overworld && game.scene.isActive('OverworldScene')) {
      overworld.revitalizeParty();
    } else if (battle && game.scene.isActive('BattleScene')) {
      battle.refreshPartyHp?.();
    }

    const toast = document.getElementById('save-toast');
    if (toast) {
      toast.innerText = '💖 Team Revitalized to Full HP!';
      toast.style.background = '#0284c7';
      toast.style.opacity = '1';
      setTimeout(() => (toast.style.opacity = '0'), 1800);
    }
  });

  saveBtn?.addEventListener('click', async () => {
    const rawParty = localStorage.getItem('monster_proto_party');
    const rawDex = localStorage.getItem('monster_proto_dex');
    const party = rawParty ? JSON.parse(rawParty) : [];
    const dex = rawDex ? JSON.parse(rawDex) : { 1: true };

    const savePayload = {
      posX: 5,
      posY: 5,
      championBeaten: 0,
      party,
      box: [],
      dex
    };

    const saved = await PersistenceManager.saveState(savePayload);
    const toast = document.getElementById('save-toast');
    if (toast) {
      toast.innerText = saved ? '💾 Game Saved to Cloud!' : '💾 Game Saved Locally!';
      toast.style.background = '#10b981';
      toast.style.opacity = '1';
      setTimeout(() => (toast.style.opacity = '0'), 2000);
    }
  });
});
