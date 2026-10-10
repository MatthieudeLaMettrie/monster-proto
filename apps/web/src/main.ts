import Phaser from 'phaser';
import { GalleryScene } from './GalleryScene.js';
import { OverworldScene } from './OverworldScene.js';
import { BattleScene } from './BattleScene.js';
import { PartyScene } from './PartyScene.js';
import { StarterSelectScene } from './StarterSelectScene.js';
import { PersistenceManager } from './persistence.js';

class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.json('worldMap', '/map.json');
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
        const hasParty = localStorage.getItem('monster_proto_party');
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

new Phaser.Game(config);
