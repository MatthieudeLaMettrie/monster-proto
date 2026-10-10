import Phaser from 'phaser';
import { SPECIES, ELEMENT_TYPES } from '@monster-proto/shared';

export class GalleryScene extends Phaser.Scene {
  private page = 0;
  private readonly perPage = 12;

  constructor() {
    super('GalleryScene');
  }

  preload() {
    // Preload all 60 monster SVGs
    for (const s of SPECIES) {
      this.load.svg(`monster-${s.id}`, `/sprites/${s.id}.svg`, { width: 64, height: 64 });
    }
  }

  create() {
    this.add.text(240, 20, 'Monster Proto - Species Gallery (M2)', {
      fontSize: '18px',
      color: '#FFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.renderPage();

    // Navigation buttons
    const prevBtn = this.add.text(100, 295, '◀ Previous', { fontSize: '14px', color: '#4ECDC4' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (this.page > 0) {
          this.page--;
          this.renderPage();
        }
      });

    const nextBtn = this.add.text(380, 295, 'Next ▶', { fontSize: '14px', color: '#4ECDC4' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if ((this.page + 1) * this.perPage < SPECIES.length) {
          this.page++;
          this.renderPage();
        }
      });
  }

  private renderPage() {
    // Clear previous items
    const children = this.children.getChildren();
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child.name === 'grid-item') {
        child.destroy();
      }
    }

    const start = this.page * this.perPage;
    const pageSpecies = SPECIES.slice(start, start + this.perPage);

    const cols = 4;
    const cellWidth = 105;
    const cellHeight = 75;
    const startX = 65;
    const startY = 65;

    pageSpecies.forEach((s, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = startX + col * cellWidth;
      const y = startY + row * cellHeight;

      const sprite = this.add.image(x, y, `monster-${s.id}`)
        .setName('grid-item')
        .setScale(0.85);

      const label = this.add.text(x, y + 30, `${s.name} (S${s.stage})`, {
        fontSize: '11px',
        color: '#E2E8F0',
        align: 'center'
      }).setOrigin(0.5).setName('grid-item');

      const typeLabel = this.add.text(x, y + 42, s.type, {
        fontSize: '9px',
        color: '#94A3B8'
      }).setOrigin(0.5).setName('grid-item');
    });

    const pageIndicator = this.children.getByName('page-indicator');
    if (pageIndicator) pageIndicator.destroy();

    this.add.text(240, 295, `Page ${this.page + 1} / ${Math.ceil(SPECIES.length / this.perPage)}`, {
      fontSize: '12px',
      color: '#CBD5E1'
    }).setOrigin(0.5).setName('page-indicator');
  }
}
