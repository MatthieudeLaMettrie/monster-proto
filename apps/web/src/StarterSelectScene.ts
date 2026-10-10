import Phaser from 'phaser';
import { SPECIES, calculateMaxHp, MonsterInstance } from '@monster-proto/shared';

export class StarterSelectScene extends Phaser.Scene {
  constructor() {
    super('StarterSelectScene');
  }

  create() {
    // Background
    this.add.rectangle(240, 160, 480, 320, 0x0f172a);

    this.add.text(240, 40, 'Choose Your First Monster!', {
      fontSize: '22px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(240, 70, 'Select a starter partner to begin your adventure:', {
      fontSize: '12px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    // Starters: Fire (1 - Emberpup), Water (10 - Puddlefin), Grass (19 - Sproutle)
    const starters = [
      { id: 1, name: 'Emberpup', type: 'Fire', color: 0xf26b38, stroke: 0xd9381e, move: 'ember_nip', desc: 'Fiery pup with high attack power' },
      { id: 10, name: 'Puddlefin', type: 'Water', color: 0x3a86ff, stroke: 0x1d4ed8, move: 'splash_jet', desc: 'Agile swimmer with balanced attributes' },
      { id: 19, name: 'Sproutle', type: 'Grass', color: 0x3bb273, stroke: 0x15803d, move: 'leaf_dart', desc: 'Sturdy turtle with resilient defense' }
    ];

    starters.forEach((s, idx) => {
      const x = 90 + idx * 150;
      const y = 170;

      // Card background
      const card = this.add.rectangle(x, y, 130, 160, 0x1e293b)
        .setStrokeStyle(2, s.stroke)
        .setInteractive({ useHandCursor: true });

      // Monster SVG Image
      this.add.image(x, y - 35, `monster-${s.id}`).setScale(1.2);

      // Name & Type
      this.add.text(x, y + 15, s.name, {
        fontSize: '14px',
        color: '#fff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.add.text(x, y + 32, s.type, {
        fontSize: '11px',
        color: '#cbd5e1'
      }).setOrigin(0.5);

      // Description
      this.add.text(x, y + 54, s.desc, {
        fontSize: '8px',
        color: '#94a3b8',
        align: 'center',
        wordWrap: { width: 110 }
      }).setOrigin(0.5);

      // Card hover effect & click
      card.on('pointerover', () => card.setFillStyle(0x334155));
      card.on('pointerout', () => card.setFillStyle(0x1e293b));
      card.on('pointerdown', () => this.selectStarter(s));
    });
  }

  private selectStarter(starter: { id: number; name: string; type: string; move: string }) {
    const spec = SPECIES.find(s => s.id === starter.id)!;
    const maxHp = calculateMaxHp(spec.baseStats.hp, 5);

    const monster: MonsterInstance = {
      id: 'starter-' + Date.now(),
      speciesId: starter.id,
      nickname: starter.name,
      level: 5,
      xp: 0,
      currentHp: maxHp,
      maxHp,
      moves: ['tackle', starter.move],
      partySlot: 0
    };

    // Save to localStorage as starter team
    localStorage.setItem('monster_proto_party', JSON.stringify([monster]));
    const dex = { [starter.id]: true };
    localStorage.setItem('monster_proto_dex', JSON.stringify(dex));

    this.cameras.main.flash(400, 255, 255, 255);
    this.time.delayedCall(450, () => {
      this.scene.start('OverworldScene');
    });
  }
}
