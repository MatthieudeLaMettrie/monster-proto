import Phaser from 'phaser';
import { ELEMENT_TYPES } from '@monster-proto/shared';

class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.add.text(240, 100, 'Monster Proto', {
      fontSize: '28px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(240, 150, 'Prototype v0.1', {
      fontSize: '16px',
      color: '#aaa'
    }).setOrigin(0.5);

    this.add.text(240, 200, `Types: ${ELEMENT_TYPES.join(', ')}`, {
      fontSize: '13px',
      color: '#4ecdc4',
      wordWrap: { width: 400 }
    }).setOrigin(0.5);

    const statusText = this.add.text(240, 260, 'Checking API status...', {
      fontSize: '14px',
      color: '#ffd166'
    }).setOrigin(0.5);

    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        statusText.setText(`API Connected: ${data.game} (${data.status})`);
        statusText.setColor('#06d6a0');
      })
      .catch(() => {
        statusText.setText('Running in standalone client mode');
        statusText.setColor('#888');
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
  scene: [BootScene]
};

new Phaser.Game(config);
