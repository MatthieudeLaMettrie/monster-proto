import Phaser from 'phaser';
import {
  MAP_ZONES,
  EncounterZone,
  getSpecies,
  MonsterInstance,
  calculateMaxHp,
  getDefaultMoves,
  ITEMS,
  DEFAULT_INVENTORY,
  InventoryBag,
  PlayerPresence
} from '@monster-proto/shared';
import { Sound } from './SoundManager.js';
import { MultiplayerManager } from './MultiplayerManager.js';

interface ItemPickup {
  id: string;
  x: number;
  y: number;
  itemId: string;
  sprite?: Phaser.GameObjects.Arc;
}

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
  private encounterCooldownSteps = 0;
  private bannerText!: Phaser.GameObjects.Text;
  private logText!: Phaser.GameObjects.Text;

  private itemPickups: ItemPickup[] = [
    { id: 'item-route1', x: 16, y: 4, itemId: 'potion' },
    { id: 'item-lake', x: 6, y: 18, itemId: 'super_potion' },
    { id: 'item-crags', x: 31, y: 5, itemId: 'ultra_capsule' },
    { id: 'item-grove', x: 21, y: 20, itemId: 'revive' },
    { id: 'item-dojo', x: 32, y: 24, itemId: 'super_potion' }
  ];

  private championPromptContainer?: Phaser.GameObjects.Container;
  private otherPlayerSprites: Map<string, { rect: Phaser.GameObjects.Rectangle; nameTag: Phaser.GameObjects.Text }> = new Map();

  constructor() {
    super('OverworldScene');
  }

  init(data?: { returnTile?: { x: number; y: number }; justExitedBattle?: boolean }) {
    if (data?.returnTile) {
      this.playerTile = { ...data.returnTile };
    }
    this.isMoving = false;
    if (data?.justExitedBattle) {
      this.encounterCooldownSteps = 3; // Grace period after exiting battle
    }
  }

  create() {
    this.mapData = this.cache.json.get('worldMap');
    this.renderTiles();
    this.renderItemPickups();
    this.renderChampionNpc();
    this.setupMultiplayer();

    // Create player avatar
    const px = this.playerTile.x * this.tileSize + 8;
    const py = this.playerTile.y * this.tileSize + 8;
    this.playerSprite = this.add.rectangle(px, py, 12, 12, 0xe11d48).setDepth(10);

    // Camera setup
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

    // UI Overlays: Location Banner (Top-Left)
    this.bannerText = this.add.text(12, 12, 'Pallet Plaza (Safe Town)', {
      fontSize: '12px',
      color: '#FFFFFF',
      backgroundColor: '#0f172aEE',
      padding: { x: 8, y: 5 }
    }).setScrollFactor(0).setDepth(200);

    // Big Prominent Party & DEX Button (Top-Right)
    this.add.rectangle(420, 20, 96, 30, 0x0284c7)
      .setScrollFactor(0)
      .setDepth(200)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.openPartyMenu());

    this.add.text(420, 20, '👥 PARTY / DEX', {
      fontSize: '10px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    this.logText = this.add.text(12, 296, 'Move with Arrows / WASD. Walk on tall grass for encounters.', {
      fontSize: '10px',
      color: '#CBD5E1',
      backgroundColor: '#0f172aEE',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(200);

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
    if (this.isMoving) return;

    // Dismiss champion prompt if moving away
    if (this.championPromptContainer) {
      this.championPromptContainer.destroy();
      this.championPromptContainer = undefined;
    }

    const targetX = this.playerTile.x + dx;
    const targetY = this.playerTile.y + dy;

    // Bounds check
    if (targetX < 0 || targetX >= this.mapData.width || targetY < 0 || targetY >= this.mapData.height) {
      return;
    }

    // Collision check
    const idx = targetY * this.mapData.width + targetX;
    if (this.mapData.layers.collision[idx] !== 0) {
      return;
    }

    this.isMoving = true;
    this.playerTile = { x: targetX, y: targetY };
    MultiplayerManager.getInstance().sendMove(targetX, targetY);

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

    // Check item pickup
    this.checkItemPickup(x, y);

    // Check Heal tile (Revitalize Spot)
    if (this.mapData.layers.ground[idx] === 6) {
      this.revitalizeParty();
      return;
    }

    // Check Champion Spot at Dojo
    if (x === this.mapData.championSpot.x && y === this.mapData.championSpot.y) {
      this.showChampionPrompt();
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
        Sound.playGrassStep();
        if (this.encounterCooldownSteps > 0) {
          this.encounterCooldownSteps--;
        } else if (Math.random() < 0.14) {
          this.triggerEncounter(zoneDef);
        }
      }
    } else {
      this.bannerText.setText('Pallet Plaza (Town)');
    }
  }

  private renderChampionNpc() {
    const cx = this.mapData.championSpot.x * this.tileSize + 8;
    const cy = this.mapData.championSpot.y * this.tileSize + 8;

    // Golden Master NPC avatar
    this.add.circle(cx, cy, 7, 0xf59e0b).setStrokeStyle(2, 0xd97706).setDepth(9);
    this.add.text(cx, cy - 14, '👑 Master', {
      fontSize: '8px',
      color: '#fbbf24',
      backgroundColor: '#0f172aEE',
      padding: { x: 3, y: 1 }
    }).setOrigin(0.5).setDepth(10);
  }

  private showChampionPrompt() {
    if (this.championPromptContainer) return;

    this.championPromptContainer = this.add.container(240, 160).setScrollFactor(0).setDepth(300);

    const bg = this.add.rectangle(0, 0, 320, 140, 0x0f172a, 0.95).setStrokeStyle(2, 0xf59e0b);
    const title = this.add.text(0, -45, '👑 DOJO CHAMPION AARON', {
      fontSize: '13px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const desc = this.add.text(0, -15, '"I am Master Aaron! Prove your worth\nin an ultimate 3v3 Champion Battle!"', {
      fontSize: '10px',
      color: '#f8fafc',
      align: 'center'
    }).setOrigin(0.5);

    const challengeBtn = this.add.rectangle(-65, 35, 120, 30, 0xd97706)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.startChampionBattle());

    const challengeTxt = this.add.text(-65, 35, '⚔️ Challenge (3v3)', {
      fontSize: '10px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const leaveBtn = this.add.rectangle(75, 35, 90, 30, 0x475569)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.championPromptContainer?.destroy();
        this.championPromptContainer = undefined;
      });

    const leaveTxt = this.add.text(75, 35, 'Leave', {
      fontSize: '10px',
      color: '#fff'
    }).setOrigin(0.5);

    this.championPromptContainer.add([bg, title, desc, challengeBtn, challengeTxt, leaveBtn, leaveTxt]);
  }

  private startChampionBattle() {
    this.championPromptContainer?.destroy();
    this.championPromptContainer = undefined;

    Sound.playWiggle();
    this.cameras.main.flash(400, 245, 158, 11);

    const playerParty = this.getPlayerParty();

    // 3v3 Stage-3 Champion Team
    const championTeam: MonsterInstance[] = [
      {
        id: 'champ-1',
        speciesId: 60,
        nickname: 'Ursumaul',
        level: 16,
        xp: 0,
        currentHp: calculateMaxHp(getSpecies(60).baseStats.hp, 16),
        maxHp: calculateMaxHp(getSpecies(60).baseStats.hp, 16),
        moves: getDefaultMoves(getSpecies(60), 16),
        partySlot: 0
      },
      {
        id: 'champ-2',
        speciesId: 3,
        nickname: 'Infernmastiff',
        level: 16,
        xp: 0,
        currentHp: calculateMaxHp(getSpecies(3).baseStats.hp, 16),
        maxHp: calculateMaxHp(getSpecies(3).baseStats.hp, 16),
        moves: getDefaultMoves(getSpecies(3), 16),
        partySlot: 1
      },
      {
        id: 'champ-3',
        speciesId: 9,
        nickname: 'Volcarapace',
        level: 17,
        xp: 0,
        currentHp: calculateMaxHp(getSpecies(9).baseStats.hp, 17),
        maxHp: calculateMaxHp(getSpecies(9).baseStats.hp, 17),
        moves: getDefaultMoves(getSpecies(9), 17),
        partySlot: 2
      }
    ];

    this.time.delayedCall(450, () => {
      this.scene.start('BattleScene', {
        playerParty,
        isTrainerBattle: true,
        trainerName: 'Master Aaron',
        trainerParty: championTeam,
        returnScene: 'OverworldScene',
        returnTile: { ...this.playerTile }
      });
    });
  }

  private renderItemPickups() {
    const raw = localStorage.getItem('monster_proto_collected_items');
    const collected: Record<string, boolean> = raw ? JSON.parse(raw) : {};

    this.itemPickups.forEach((pickup) => {
      if (collected[pickup.id]) return;

      const px = pickup.x * this.tileSize + 8;
      const py = pickup.y * this.tileSize + 8;

      const circle = this.add.circle(px, py, 5, 0xef4444).setStrokeStyle(1.5, 0xffffff).setDepth(8);
      pickup.sprite = circle;

      // Gentle floating animation
      this.tweens.add({
        targets: circle,
        y: py - 3,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  private checkItemPickup(x: number, y: number) {
    const raw = localStorage.getItem('monster_proto_collected_items');
    const collected: Record<string, boolean> = raw ? JSON.parse(raw) : {};

    const pickup = this.itemPickups.find(p => p.x === x && p.y === y && !collected[p.id]);
    if (!pickup) return;

    collected[pickup.id] = true;
    localStorage.setItem('monster_proto_collected_items', JSON.stringify(collected));

    if (pickup.sprite) {
      pickup.sprite.destroy();
    }

    // Add to inventory
    const rawInv = localStorage.getItem('monster_proto_inventory');
    const inv: InventoryBag = rawInv ? { ...DEFAULT_INVENTORY, ...JSON.parse(rawInv) } : { ...DEFAULT_INVENTORY };
    inv[pickup.itemId] = (inv[pickup.itemId] || 0) + 1;
    localStorage.setItem('monster_proto_inventory', JSON.stringify(inv));

    Sound.playCatchSuccess();
    const item = ITEMS[pickup.itemId];
    this.logText.setText(`🎁 Found a ${item?.name || 'Item'}! Added to your Bag!`);

    const toast = document.getElementById('save-toast');
    if (toast) {
      toast.innerText = `🎁 Found a ${item?.name || 'Item'}!`;
      toast.style.background = '#16a34a';
      toast.style.opacity = '1';
      setTimeout(() => (toast.style.opacity = '0'), 1800);
    }
  }

  private triggerEncounter(zone: EncounterZone) {
    if (this.isMoving) return;
    this.isMoving = true;

    const level = Phaser.Math.Between(zone.minLevel, zone.maxLevel);
    const speciesId = Phaser.Utils.Array.GetRandom(zone.speciesIds);
    const wildSpecies = getSpecies(speciesId);

    Sound.playWiggle();
    this.logText.setText(`Wild ${wildSpecies.name} (Lv ${level}, ${wildSpecies.type}) appeared!`);
    this.cameras.main.flash(350, 255, 255, 255);

    const playerParty = this.getPlayerParty();

    this.time.delayedCall(400, () => {
      this.isMoving = false;
      this.scene.start('BattleScene', {
        playerParty,
        wildSpeciesId: speciesId,
        wildLevel: level,
        returnScene: 'OverworldScene',
        returnTile: { ...this.playerTile }
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

  private getPlayerParty(): MonsterInstance[] {
    const raw = localStorage.getItem('monster_proto_party');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {}
    }
    const starterSpecies = getSpecies(1);
    const maxHp = calculateMaxHp(starterSpecies.baseStats.hp, 5);
    const starter: MonsterInstance = {
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
    try {
      localStorage.setItem('monster_proto_party', JSON.stringify([starter]));
    } catch {}
    return [starter];
  }

  public revitalizeParty() {
    const party = this.getPlayerParty();
    party.forEach((mon) => {
      mon.currentHp = mon.maxHp;
    });
    try {
      localStorage.setItem('monster_proto_party', JSON.stringify(party));
    } catch {}
    Sound.playRevitalize();
    if (this.logText && this.logText.active) {
      this.logText.setText('💖 Revitalized! All team members restored to full HP!');
    }
    if (this.cameras?.main) {
      this.cameras.main.flash(300, 50, 205, 50);
    }

    const toast = document.getElementById('save-toast');
    if (toast) {
      toast.innerText = '💖 Team Revitalized to Full HP!';
      toast.style.background = '#0284c7';
      toast.style.opacity = '1';
      setTimeout(() => (toast.style.opacity = '0'), 1800);
    }
  }

  public openPartyMenu() {
    const party = this.getPlayerParty();
    const rawDex = localStorage.getItem('monster_proto_dex');
    const dex = rawDex ? JSON.parse(rawDex) : { 1: true };

    this.scene.pause('OverworldScene');
    this.scene.launch('PartyScene', {
      party,
      dex,
      returnScene: 'OverworldScene'
    });
  }

  private setupMultiplayer() {
    const mp = MultiplayerManager.getInstance();
    mp.connect();

    mp.onPlayersUpdated((players) => {
      // Remove disconnected players
      const activeIds = new Set(players.map(p => p.id));
      for (const [id, spr] of this.otherPlayerSprites.entries()) {
        if (!activeIds.has(id)) {
          spr.rect.destroy();
          spr.nameTag.destroy();
          this.otherPlayerSprites.delete(id);
        }
      }

      // Render/update positions of other players
      players.forEach(p => {
        const px = p.x * this.tileSize + 8;
        const py = p.y * this.tileSize + 8;

        let entry = this.otherPlayerSprites.get(p.id);
        if (!entry) {
          const rect = this.add.rectangle(px, py, 12, 12, 0x06b6d4).setDepth(9)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.showChallengePrompt(p));

          const nameTag = this.add.text(px, py - 12, p.name || 'Trainer', {
            fontSize: '8px',
            color: '#38bdf8',
            backgroundColor: '#0f172aEE',
            padding: { x: 3, y: 1 }
          }).setOrigin(0.5).setDepth(10);

          entry = { rect, nameTag };
          this.otherPlayerSprites.set(p.id, entry);
        } else {
          entry.rect.setPosition(px, py);
          entry.nameTag.setPosition(px, py - 12);
        }
      });
    });

    mp.onChallenged((fromId, fromName) => {
      this.showIncomingChallenge(fromId, fromName);
    });

    mp.onMatchStart((battleId, oppName) => {
      this.logText.setText(`⚔️ Matched with ${oppName}! Starting PvP battle...`);
      Sound.playLevelUp();
    });
  }

  private showChallengePrompt(target: PlayerPresence) {
    if (this.championPromptContainer) {
      this.championPromptContainer.destroy();
      this.championPromptContainer = undefined;
    }

    const container = this.add.container(240, 160).setScrollFactor(0).setDepth(300);
    this.championPromptContainer = container;

    const bg = this.add.rectangle(0, 0, 300, 120, 0x0f172a, 0.95).setStrokeStyle(2, 0x06b6d4);
    const title = this.add.text(0, -35, `⚔️ PvP Challenge: ${target.name}`, {
      fontSize: '12px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const desc = this.add.text(0, -10, 'Challenge this trainer to a live 3v3 PvP battle?', {
      fontSize: '10px',
      color: '#cbd5e1'
    }).setOrigin(0.5);

    const sendBtn = this.add.rectangle(-60, 25, 100, 28, 0x0284c7)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        MultiplayerManager.getInstance().challengePlayer(target.id);
        this.logText.setText(`Sent PvP challenge to ${target.name}! Waiting for response...`);
        container.destroy();
        this.championPromptContainer = undefined;
      });

    const sendTxt = this.add.text(-60, 25, 'Challenge', {
      fontSize: '10px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const cancelBtn = this.add.rectangle(60, 25, 80, 28, 0x475569)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        container.destroy();
        this.championPromptContainer = undefined;
      });

    const cancelTxt = this.add.text(60, 25, 'Cancel', {
      fontSize: '10px',
      color: '#fff'
    }).setOrigin(0.5);

    container.add([bg, title, desc, sendBtn, sendTxt, cancelBtn, cancelTxt]);
  }

  private showIncomingChallenge(fromId: string, fromName: string) {
    Sound.playWiggle();
    const container = this.add.container(240, 160).setScrollFactor(0).setDepth(300);

    const bg = this.add.rectangle(0, 0, 310, 120, 0x0f172a, 0.98).setStrokeStyle(2, 0x22c55e);
    const title = this.add.text(0, -35, `⚔️ Incoming PvP Challenge!`, {
      fontSize: '13px',
      color: '#4ade80',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const desc = this.add.text(0, -10, `${fromName} has challenged you to a 3v3 PvP battle!`, {
      fontSize: '10px',
      color: '#f8fafc'
    }).setOrigin(0.5);

    const acceptBtn = this.add.rectangle(-60, 25, 90, 28, 0x16a34a)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        MultiplayerManager.getInstance().respondChallenge(fromId, true);
        container.destroy();
      });

    const acceptTxt = this.add.text(-60, 25, 'Accept', {
      fontSize: '10px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const declineBtn = this.add.rectangle(60, 25, 90, 28, 0xdc2626)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        MultiplayerManager.getInstance().respondChallenge(fromId, false);
        container.destroy();
      });

    const declineTxt = this.add.text(60, 25, 'Decline', {
      fontSize: '10px',
      color: '#fff'
    }).setOrigin(0.5);

    container.add([bg, title, desc, acceptBtn, acceptTxt, declineBtn, declineTxt]);
  }
}
