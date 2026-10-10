import Phaser from 'phaser';
import { MAP_ZONES, EncounterZone, getSpecies, SPECIES } from '@monster-proto/shared';

export class OverworldScene extends Phaser.Scene {
  private mapData: any;
  private playerTile = { x: 5, y: 5 };
  private playerSprite!: Phaser.GameObjects.Rectangle;
  private tileSize = 16;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private isMoving = false;
  private bannerText!: Phaser.GameObjects.Text;
  private logText!: Phaser.GameObjects.Text;

  constructor() {
    super('OverworldScene');
  }

  preload() {
    this.load.json('worldMap', '/map.json');
  }

  create() {
    this.mapData = this.cache.json.get('worldMap');
    this.renderTiles();

    // Create player avatar (crisp 14x14 box with direction indicator)
    const px = this.playerTile.x * this.tileSize + 8;
    const py = this.playerTile.y * this.tileSize + 8;
    this.playerSprite = this.add.rectangle(px, py, 12, 12, 0xe11d48).setDepth(10);

    // Camera setup (zoom 2.5x to focus on character, bounds clamped)
    this.cameras.main.setBounds(0, 0, this.mapData.width * this.tileSize, this.mapData.height * this.tileSize);
    this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(2.2);

    // Controls
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      };
    }

    // UI overlays fixed on screen
    this.bannerText = this.add.text(10, 10, 'Pallet Plaza (Safe Town)', {
      fontSize: '11px',
      color: '#FFFFFF',
      backgroundColor: '#000000AA',
      padding: { x: 6, y: 3 }
    }).setScrollFactor(0).setDepth(100);

    // Party & Dex button (Top-Right)
    const partyBtn = this.add.text(400, 10, '👥 Party', {
      fontSize: '11px',
      color: '#38bdf8',
      backgroundColor: '#000000AA',
      padding: { x: 6, y: 3 }
    }).setScrollFactor(0).setDepth(100).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.openPartyMenu();
    });

    this.logText = this.add.text(10, 290, 'Move with Arrows / WASD. Walk on tall grass for encounters.', {
      fontSize: '9px',
      color: '#CBD5E1',
      backgroundColor: '#000000AA',
      padding: { x: 5, y: 3 }
    }).setScrollFactor(0).setDepth(100);

    // On-screen touch/virtual controls for mobile friendly navigation
    this.createVirtualDpad();
  }

  update() {
    if (this.isMoving) return;

    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) dx = -1;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) dx = 1;
    else if (this.cursors.up.isDown || this.wasd.W.isDown) dy = -1;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) dy = 1;

    if (dx !== 0 || dy !== 0) {
      this.attemptMove(dx, dy);
    }
  }

  private attemptMove(dx: number, dy: number) {
    const targetX = this.playerTile.x + dx;
    const targetY = this.playerTile.y + dy;

    // Bounds check
    if (targetX < 0 || targetX >= this.mapData.width || targetY < 0 || targetY >= this.mapData.height) {
      return;
    }

    // Collision check
    const idx = targetY * this.mapData.width + targetX;
    if (this.mapData.layers.collision[idx] !== 0) {
      return; // blocked
    }

    this.isMoving = true;
    this.playerTile = { x: targetX, y: targetY };

    this.tweens.add({
      targets: this.playerSprite,
      x: targetX * this.tileSize + 8,
      y: targetY * this.tileSize + 8,
      duration: 130,
      ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
        this.onStepComplete(targetX, targetY);
      }
    });
  }

  private onStepComplete(x: number, y: number) {
    const idx = y * this.mapData.width + x;

    // Check Heal tile
    if (this.mapData.layers.ground[idx] === 6) {
      this.logText.setText('Heal Spot: Your team has been fully restored!');
      this.cameras.main.flash(200, 50, 205, 50);
      return;
    }

    // Check Champion Spot
    if (x === this.mapData.championSpot.x && y === this.mapData.championSpot.y) {
      this.logText.setText('Champion NPC: "Are you ready to face the Master?"');
      return;
    }

    // Zone detection
    const currentZone = this.mapData.zones.find(
      (z: any) => x >= z.x1 && x <= z.x2 && y >= z.y1 && y <= z.y2
    );

    if (currentZone && MAP_ZONES[currentZone.zoneId]) {
      const zoneDef = MAP_ZONES[currentZone.zoneId];
      this.bannerText.setText(`${zoneDef.name} (Lv ${zoneDef.minLevel}-${zoneDef.maxLevel})`);

      // Tall grass encounter roll
      if (this.mapData.layers.tallGrass[idx] === 3) {
        if (Math.random() < 0.12) {
          this.triggerEncounter(zoneDef);
        }
      }
    } else {
      this.bannerText.setText('Pallet Plaza (Town)');
    }
  }

  private triggerEncounter(zone: EncounterZone) {
    const level = Phaser.Math.Between(zone.minLevel, zone.maxLevel);
    const speciesId = Phaser.Utils.Array.GetRandom(zone.speciesIds);
    const wildSpecies = getSpecies(speciesId);

    this.logText.setText(`Wild ${wildSpecies.name} (Lv ${level}, ${wildSpecies.type}) appeared!`);
    this.cameras.main.flash(400, 255, 255, 255);

    // Default starter party for player if not already created
    const starterSpecies = getSpecies(1); // Emberpup
    const maxHp = calculateMaxHp(starterSpecies.baseStats.hp, 5);
    const starterMonster = {
      id: 'starter-1',
      speciesId: 1,
      nickname: 'Emberpup',
      level: 5,
      xp: 0,
      currentHp: maxHp,
      maxHp,
      moves: ['tackle', 'ember_nip'],
      partySlot: 0
    };

    this.time.delayedCall(450, () => {
      this.scene.pause('OverworldScene');
      this.scene.launch('BattleScene', {
        playerParty: [starterMonster],
        wildSpeciesId: speciesId,
        wildLevel: level,
        returnScene: 'OverworldScene'
      });
    });
  }

  private renderTiles() {
    const { width, height, layers } = this.mapData;
    const gfx = this.add.graphics();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const px = x * this.tileSize;
        const py = y * this.tileSize;

        // Ground
        const ground = layers.ground[idx];
        if (ground === 1) gfx.fillStyle(0x4ade80, 1); // Meadow grass
        else if (ground === 2) gfx.fillStyle(0xfde047, 1); // Path stone
        else if (ground === 6) gfx.fillStyle(0x38bdf8, 1); // Heal pad
        else if (ground === 7) gfx.fillStyle(0xf97316, 1); // Dojo arena
        else gfx.fillStyle(0x22c55e, 1);
        gfx.fillRect(px, py, this.tileSize, this.tileSize);

        // Tall grass
        if (layers.tallGrass[idx] === 3) {
          gfx.fillStyle(0x15803d, 1);
          gfx.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
        }

        // Obstacles & Water
        const col = layers.collision[idx];
        if (col === 4) {
          gfx.fillStyle(0x2563eb, 1); // Deep water
          gfx.fillRect(px, py, this.tileSize, this.tileSize);
        } else if (col === 5) {
          gfx.fillStyle(0x166534, 1); // Trees / crags
          gfx.fillRect(px + 1, py + 1, this.tileSize - 2, this.tileSize - 2);
        }
      }
    }
  }

  private createVirtualDpad() {
    const btnSize = 28;
    const padX = 70;
    const padY = 250;

    const mkBtn = (x: number, y: number, label: string, dx: number, dy: number) => {
      const rect = this.add.rectangle(x, y, btnSize, btnSize, 0x1e293b, 0.8)
        .setScrollFactor(0)
        .setDepth(110)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.attemptMove(dx, dy));

      this.add.text(x, y, label, { fontSize: '12px', color: '#fff' })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(111);
    };

    mkBtn(padX, padY - btnSize, '▲', 0, -1);
    mkBtn(padX, padY + btnSize, '▼', 0, 1);
    mkBtn(padX - btnSize, padY, '◀', -1, 0);
    mkBtn(padX + btnSize, padY, '▶', 1, 0);
  }

  private openPartyMenu() {
    const starterSpecies = getSpecies(1);
    const maxHp = calculateMaxHp(starterSpecies.baseStats.hp, 5);
    const starterMonster = {
      id: 'starter-1',
      speciesId: 1,
      nickname: 'Emberpup',
      level: 5,
      xp: 0,
      currentHp: maxHp,
      maxHp,
      moves: ['tackle', 'ember_nip'],
      partySlot: 0
    };

    this.scene.pause('OverworldScene');
    this.scene.launch('PartyScene', {
      party: [starterMonster],
      dex: { 1: true },
      returnScene: 'OverworldScene'
    });
  }
}
