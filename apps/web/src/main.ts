import Phaser from 'phaser';
import { GalleryScene } from './GalleryScene.js';

class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.add.text(240, 70, 'Monster Proto', {
      fontSize: '26px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(240, 110, 'Milestone 2: 60 Procedural SVGs Ready', {
      fontSize: '14px',
      color: '#06d6a0'
    }).setOrigin(0.5);

    const btn = this.add.rectangle(240, 180, 220, 44, 0x3a86ff)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('GalleryScene');
      });

    this.add.text(240, 180, 'Open Monster Gallery', {
      fontSize: '15px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const statusText = this.add.text(240, 250, 'Backend API Check...', {
      fontSize: '12px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        statusText.setText(`API Health: OK (${data.game})`);
        statusText.setColor('#06d6a0');
      })
      .catch(() => {
        statusText.setText('Running local client');
      });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 480,
  height: 320,
  parent: 'game-container',
  pixelArt: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, GalleryScene]
};

new Phaser.Game(config);
