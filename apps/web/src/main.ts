import Phaser from 'phaser';
import { GalleryScene } from './GalleryScene.js';
import { OverworldScene } from './OverworldScene.js';

class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.add.text(240, 50, 'Monster Proto', {
      fontSize: '28px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(240, 85, '2D Browser Monster Battle Prototype', {
      fontSize: '13px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    // Play button -> starts Overworld
    const playBtn = this.add.rectangle(240, 150, 200, 42, 0x10b981)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('OverworldScene');
      });

    this.add.text(240, 150, '▶ Start Adventure (Map)', {
      fontSize: '14px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Gallery button
    const galleryBtn = this.add.rectangle(240, 205, 200, 42, 0x3b82f6)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('GalleryScene');
      });

    this.add.text(240, 205, '📜 View 60 Monsters', {
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
  scene: [BootScene, OverworldScene, GalleryScene]
};

new Phaser.Game(config);
