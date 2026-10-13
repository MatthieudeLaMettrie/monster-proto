import Phaser from 'phaser';
import {
  MAP_ZONES,
  EncounterZone,
  getSpecies,
  MonsterInstance,
  calculateMaxHp,
  getDefaultMoves,
  MOVES,
  ITEMS,
  DEFAULT_INVENTORY,
  InventoryBag,
  PlayerPresence,
  GYM_LEADERS,
  GymLeaderDef,
  BADGES,
  REQUIRED_BADGES_FOR_CHAMPION
} from '@monster-proto/shared';
import { Sound } from './SoundManager.js';
import { MultiplayerManager } from './MultiplayerManager.js';
import { createTrainerTextures } from './TrainerTexture.js';

interface ItemPickup {
  id: string;
  x: number;
  y: number;
  itemId: string;
  sprite?: Phaser.GameObjects.Arc;
}

export interface Signpost {
  x: number;
  y: number;
  title: string;
  text: string;
}

export class OverworldScene extends Phaser.Scene {
  private mapData: any;
  private playerTile = { x: 10, y: 10 };
  private playerSprite!: Phaser.GameObjects.Image;
  private facing: 'down' | 'up' | 'left' | 'right' = 'down';
  private stepToggle = false;
  private companionSprite?: Phaser.GameObjects.Image;
  private companionShadow?: Phaser.GameObjects.Ellipse;
  private companionTile = { x: 10, y: 11 };
  private tileSize = 16;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private isMoving = false;
  private isSprinting = false;
  private shiftKey?: Phaser.Input.Keyboard.Key;
  private sprintBtnText?: Phaser.GameObjects.Text;
  private encounterCooldownSteps = 0;
  private bannerText!: Phaser.GameObjects.Text;
  private logText!: Phaser.GameObjects.Text;

  private itemPickups: ItemPickup[] = [
    { id: 'item-town', x: 15, y: 7, itemId: 'potion' },
    { id: 'item-route1-n', x: 28, y: 6, itemId: 'potion' },
    { id: 'item-route1-clearing', x: 33, y: 4, itemId: 'ultra_capsule' },
    { id: 'item-route1-s', x: 40, y: 16, itemId: 'super_potion' },
    { id: 'item-lake-shore', x: 5, y: 24, itemId: 'super_potion' },
    { id: 'item-lake-pier', x: 14, y: 28, itemId: 'super_potion' },
    { id: 'item-lake-island', x: 15, y: 38, itemId: 'ultra_capsule' },
    { id: 'item-grotto', x: 8, y: 54, itemId: 'revive' },
    { id: 'item-grotto-deep', x: 17, y: 55, itemId: 'ultra_capsule' },
    { id: 'item-grove-shrine', x: 38, y: 39, itemId: 'ultra_capsule' },
    { id: 'item-grove-glade', x: 48, y: 53, itemId: 'revive' },
    { id: 'item-crags-foot', x: 50, y: 11, itemId: 'super_potion' },
    { id: 'item-volcano-peak', x: 65, y: 8, itemId: 'revive' },
    { id: 'item-celestial-ridge', x: 72, y: 32, itemId: 'super_potion' },
    { id: 'item-dojo-stair', x: 61, y: 46, itemId: 'revive' },
    { id: 'item-dojo-secret', x: 74, y: 49, itemId: 'ultra_capsule' }
  ];

  private signposts: Signpost[] = [
    { x: 15, y: 9, title: '📍 PALLET PLAZA CROSSROADS', text: 'East: Route 1 Meadow & Ember Volcano\nSouth: Lake Azure Pier & Sunken Grotto' },
    { x: 26, y: 9, title: '🌾 ROUTE 1 MEADOW', text: 'Watch for wild Sproutle and Boxerpup in tall grass!\nNorth clearing holds hidden treasures.' },
    { x: 44, y: 10, title: '🧭 CONTINENTAL JUNCTION', text: 'North-East: Ember Crags & Dragon Peaks\nSouth: Old Grove Enchanted Woods\nFar East: Celestial Summit & Dojo' },
    { x: 10, y: 22, title: '🌊 LAKE AZURE DOCK', text: 'Crystal waters home to Puddlefin and Skylark.\nLegend speaks of a secret island across the sandbar.' },
    { x: 30, y: 22, title: '🌲 OLD GROVE ENTRANCE', text: 'Ancient canopy ahead. Deep whispers lead to the\nforgotten Fairy Shrine.' },
    { x: 48, y: 13, title: '🌋 EMBER CRAGS PASS', text: 'Hazard Warning: Extreme volcanic heat!\nHome to wild Emberpup and fierce dragons.' },
    { x: 60, y: 44, title: '🥋 DOJO CHAMPION RIDGE', text: 'Ascend to the Grand Pagoda.\nMaster Aaron awaits worthy challengers!' }
  ];

  private signDialogContainer?: Phaser.GameObjects.Container;
  private championPromptContainer?: Phaser.GameObjects.Container;
  private gymLeaderPromptContainer?: Phaser.GameObjects.Container;
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
    createTrainerTextures(this);
    this.renderTiles();
    this.renderItemPickups();
    this.renderChampionNpc();
    this.renderGymLeaderNpcs();
    this.setupMultiplayer();

    // Create player avatar with 20x28 retro pixel-art
    const px = this.playerTile.x * this.tileSize + 8;
    const py = this.playerTile.y * this.tileSize + 8;
    this.playerSprite = this.add.image(px, py, 'trainer-down-0')
      .setOrigin(0.5, 0.82)
      .setScale(1.0)
      .setDepth(10);

    // Setup walking companion monster
    this.setupCompanion();

    // Refresh companion when returning from PartyScene
    this.events.on('resume', () => {
      this.refreshCompanion();
    });

    // Camera setup
    this.cameras.main.setBounds(0, 0, this.mapData.width * this.tileSize, this.mapData.height * this.tileSize);
    this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(2.2);

    // Controls
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
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

    // Sprint Mode Button (Top-Right, left of Party)
    const sprintBg = this.add.rectangle(325, 20, 84, 26, 0x334155)
      .setScrollFactor(0)
      .setDepth(200)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.isSprinting = !this.isSprinting;
        sprintBg.setFillStyle(this.isSprinting ? 0xe11d48 : 0x334155);
        this.sprintBtnText?.setText(this.isSprinting ? '👟 SPRINT: ON' : '👟 SPRINT: OFF');
      });

    this.sprintBtnText = this.add.text(325, 20, '👟 SPRINT: OFF', {
      fontSize: '9px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    // Big Prominent Party & DEX Button (Top-Right)
    this.add.rectangle(425, 20, 96, 26, 0x0284c7)
      .setScrollFactor(0)
      .setDepth(200)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.openPartyMenu());

    this.add.text(425, 20, '👥 PARTY / DEX', {
      fontSize: '10px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    this.logText = this.add.text(12, 296, 'Move with Arrows / WASD. Hold Shift or tap 👟 SPRINT for high speed!', {
      fontSize: '10px',
      color: '#CBD5E1',
      backgroundColor: '#0f172aEE',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(200);

    this.renderSignposts();
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

    // Dismiss champion and sign dialogs if moving away
    if (this.championPromptContainer) {
      this.championPromptContainer.destroy();
      this.championPromptContainer = undefined;
    }
    if (this.gymLeaderPromptContainer) {
      this.gymLeaderPromptContainer.destroy();
      this.gymLeaderPromptContainer = undefined;
    }
    if (this.signDialogContainer) {
      this.signDialogContainer.destroy();
      this.signDialogContainer = undefined;
    }

    const prevTile = { ...this.playerTile };
    const targetX = this.playerTile.x + dx;
    const targetY = this.playerTile.y + dy;

    // Determine facing direction
    if (dy > 0) this.facing = 'down';
    else if (dy < 0) this.facing = 'up';
    else if (dx > 0) this.facing = 'right';
    else if (dx < 0) this.facing = 'left';

    // Bounds check
    if (targetX < 0 || targetX >= this.mapData.width || targetY < 0 || targetY >= this.mapData.height) {
      this.playerSprite.setTexture(`trainer-${this.facing}-0`);
      return;
    }

    // Collision check
    const idx = targetY * this.mapData.width + targetX;
    if (this.mapData.layers.collision[idx] !== 0) {
      this.playerSprite.setTexture(`trainer-${this.facing}-0`);
      return;
    }

    this.isMoving = true;
    this.playerTile = { x: targetX, y: targetY };
    MultiplayerManager.getInstance().sendMove(targetX, targetY);

    // Toggle step walk frame
    this.stepToggle = !this.stepToggle;
    this.playerSprite.setTexture(`trainer-${this.facing}-${this.stepToggle ? 1 : 2}`);

    const isSprint = this.isSprinting || Boolean(this.shiftKey && this.shiftKey.isDown);
    const stepDuration = isSprint ? 70 : 130;

    // Emit dust puff particle when sprinting
    if (isSprint) {
      const puff = this.add.circle(this.playerSprite.x, this.playerSprite.y + 10, 2.5, 0xe2e8f0, 0.75).setDepth(9);
      this.tweens.add({
        targets: puff,
        scale: 1.8,
        alpha: 0,
        duration: 180,
        onComplete: () => puff.destroy()
      });
    }

    this.tweens.add({
      targets: this.playerSprite,
      x: targetX * this.tileSize + 8,
      y: targetY * this.tileSize + 8,
      duration: stepDuration,
      ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
        this.playerSprite.setTexture(`trainer-${this.facing}-0`);
        this.onStepComplete(targetX, targetY);
      }
    });

    // Companion monster follows to previous player tile
    if (this.companionSprite && this.companionShadow) {
      const targetCX = prevTile.x * this.tileSize + 8;
      const targetCY = prevTile.y * this.tileSize + 8;
      this.companionTile = { ...prevTile };

      // Kill any conflicting tweens so it never jitters or jumps
      this.tweens.killTweensOf(this.companionSprite);
      this.tweens.killTweensOf(this.companionShadow);
      this.companionSprite.setScale(0.52);

      // Smoothly flip sprite horizontally based on travel direction
      if (targetCX < this.companionSprite.x) {
        this.companionSprite.setFlipX(true);
      } else if (targetCX > this.companionSprite.x) {
        this.companionSprite.setFlipX(false);
      }

      this.tweens.add({
        targets: this.companionShadow,
        x: targetCX,
        y: targetCY + 5,
        duration: stepDuration,
        ease: 'Linear',
        onComplete: () => {
          this.companionShadow?.setPosition(targetCX, targetCY + 5);
        }
      });

      this.tweens.add({
        targets: this.companionSprite,
        x: targetCX,
        y: targetCY - 2,
        duration: stepDuration,
        ease: 'Linear',
        onComplete: () => {
          this.companionSprite?.setPosition(targetCX, targetCY - 2);
        }
      });
    }
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

    // Check Gym Leader spots
    const leader = GYM_LEADERS.find(l => l.tile.x === x && l.tile.y === y);
    if (leader) {
      this.showGymLeaderPrompt(leader);
      return;
    }

    // Nearby Gym Leader proximity alert
    const nearbyLeader = GYM_LEADERS.find(l => Math.abs(l.tile.x - x) <= 1 && Math.abs(l.tile.y - y) <= 1);
    if (nearbyLeader) {
      this.logText.setText(`⚔️ Gym Leader nearby: ${nearbyLeader.name} (${nearbyLeader.title})! Click them to interact.`);
    }

    // Signpost proximity check
    const nearbySign = this.signposts.find(s => Math.abs(s.x - x) <= 1 && Math.abs(s.y - y) <= 1);
    if (nearbySign) {
      this.logText.setText(`💡 Signpost nearby: "${nearbySign.title}". Click it to read directions!`);
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

    const hitZone = this.add.zone(cx, cy, 20, 20).setInteractive({ useHandCursor: true }).setDepth(11);
    hitZone.on('pointerdown', () => this.showChampionPrompt());
  }

  private renderGymLeaderNpcs() {
    GYM_LEADERS.forEach((leader) => {
      const lx = leader.tile.x * this.tileSize + 8;
      const ly = leader.tile.y * this.tileSize + 8;

      // Leader avatar
      this.add.circle(lx, ly, 7, leader.color).setStrokeStyle(2, 0xffffff).setDepth(9);
      this.add.text(lx, ly, leader.avatarIcon, { fontSize: '8px' }).setOrigin(0.5).setDepth(10);

      this.add.text(lx, ly - 14, `${leader.avatarIcon} ${leader.name}`, {
        fontSize: '8px',
        color: '#ffffff',
        backgroundColor: '#0f172aEE',
        padding: { x: 3, y: 1 }
      }).setOrigin(0.5).setDepth(10);

      // Interactive hit zone
      const hitZone = this.add.zone(lx, ly, 20, 20).setInteractive({ useHandCursor: true }).setDepth(11);
      hitZone.on('pointerdown', () => {
        this.showGymLeaderPrompt(leader);
      });
    });
  }

  private showGymLeaderPrompt(leader: GymLeaderDef) {
    if (this.gymLeaderPromptContainer) {
      this.gymLeaderPromptContainer.destroy();
      this.gymLeaderPromptContainer = undefined;
    }

    let badges: Record<string, any> = {};
    try {
      const raw = localStorage.getItem('monster_proto_badges');
      if (raw) badges = JSON.parse(raw);
    } catch {}

    const hasBadge = !!badges[leader.badgeId];

    this.gymLeaderPromptContainer = this.add.container(240, 160).setScrollFactor(0).setDepth(300);

    const bg = this.add.rectangle(0, 0, 320, 150, 0x0f172a, 0.96)
      .setStrokeStyle(2, leader.color);

    const title = this.add.text(0, -50, `${leader.avatarIcon} ${leader.name.toUpperCase()} • ${leader.title}`, {
      fontSize: '11px',
      color: '#f8fafc',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const bodyText = hasBadge
      ? `${leader.alreadyBeatenDialog}\n\n🏆 You have already earned the ${leader.badgeName}!`
      : `${leader.introDialog}\n\nReward: 🏆 ${leader.badgeName}`;

    const desc = this.add.text(0, -8, bodyText, {
      fontSize: '9.5px',
      color: hasBadge ? '#4ade80' : '#cbd5e1',
      align: 'center',
      wordWrap: { width: 280 }
    }).setOrigin(0.5);

    if (hasBadge) {
      const closeBtn = this.add.rectangle(0, 48, 90, 26, 0x334155)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.gymLeaderPromptContainer?.destroy();
          this.gymLeaderPromptContainer = undefined;
        });

      const closeTxt = this.add.text(0, 48, 'Close', {
        fontSize: '10px',
        color: '#fff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.gymLeaderPromptContainer.add([bg, title, desc, closeBtn, closeTxt]);
    } else {
      const challengeBtn = this.add.rectangle(-65, 48, 120, 28, leader.color)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.startGymLeaderBattle(leader));

      const challengeTxt = this.add.text(-65, 48, '⚔️ Challenge (2v2)', {
        fontSize: '10px',
        color: '#fff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const leaveBtn = this.add.rectangle(75, 48, 90, 28, 0x475569)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.gymLeaderPromptContainer?.destroy();
          this.gymLeaderPromptContainer = undefined;
        });

      const leaveTxt = this.add.text(75, 48, 'Leave', {
        fontSize: '10px',
        color: '#fff'
      }).setOrigin(0.5);

      this.gymLeaderPromptContainer.add([bg, title, desc, challengeBtn, challengeTxt, leaveBtn, leaveTxt]);
    }
  }

  private startGymLeaderBattle(leader: GymLeaderDef) {
    this.gymLeaderPromptContainer?.destroy();
    this.gymLeaderPromptContainer = undefined;

    Sound.playWiggle();
    this.cameras.main.flash(400, (leader.color >> 16) & 0xff, (leader.color >> 8) & 0xff, leader.color & 0xff);

    const playerParty = this.getPlayerParty();

    const gymTeam: MonsterInstance[] = leader.team.map((m, idx) => {
      const spec = getSpecies(m.speciesId);
      const maxHp = calculateMaxHp(spec.baseStats.hp, m.level);
      const moves = getDefaultMoves(spec, m.level);
      const movePp: Record<string, number> = {};
      moves.forEach(mId => {
        if (MOVES[mId]) movePp[mId] = MOVES[mId].maxPp;
      });
      return {
        id: `gym-${leader.id}-${idx}`,
        speciesId: spec.id,
        nickname: m.nickname,
        level: m.level,
        xp: 0,
        currentHp: maxHp,
        maxHp,
        moves,
        movePp,
        status: null,
        partySlot: idx
      };
    });

    this.time.delayedCall(450, () => {
      this.scene.start('BattleScene', {
        playerParty,
        isTrainerBattle: true,
        trainerName: leader.name,
        trainerParty: gymTeam,
        badgeReward: {
          id: leader.badgeId,
          name: leader.badgeName,
          leader: leader.name
        },
        returnScene: 'OverworldScene',
        returnTile: { ...this.playerTile }
      });
    });
  }

  private showChampionPrompt() {
    if (this.championPromptContainer) return;

    let badges: Record<string, any> = {};
    try {
      const raw = localStorage.getItem('monster_proto_badges');
      if (raw) badges = JSON.parse(raw);
    } catch {}

    const missingBadges = REQUIRED_BADGES_FOR_CHAMPION.filter(bId => !badges[bId]);
    const isUnlocked = missingBadges.length === 0;

    this.championPromptContainer = this.add.container(240, 160).setScrollFactor(0).setDepth(300);

    const bg = this.add.rectangle(0, 0, 330, 160, 0x0f172a, 0.96).setStrokeStyle(2, 0xf59e0b);
    const title = this.add.text(0, -52, '👑 DOJO CHAMPION AARON', {
      fontSize: '13px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    if (!isUnlocked) {
      const missingNames = missingBadges.map(b => BADGES[b].name).join(', ');
      const desc = this.add.text(
        0,
        -10,
        `"Halt, traveler! The Grand Pagoda Dojo is strictly reserved for those who have mastered all regions.\n\nYou have earned ${4 - missingBadges.length} of 4 required badges.\nMissing: ${missingNames}.\n\nDefeat the 4 Regional Leaders first before facing the Champion!"`,
        {
          fontSize: '9.5px',
          color: '#fca5a5',
          align: 'center',
          wordWrap: { width: 300 }
        }
      ).setOrigin(0.5);

      const leaveBtn = this.add.rectangle(0, 52, 100, 28, 0x475569)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.championPromptContainer?.destroy();
          this.championPromptContainer = undefined;
        });

      const leaveTxt = this.add.text(0, 52, 'Understood', {
        fontSize: '10px',
        color: '#fff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.championPromptContainer.add([bg, title, desc, leaveBtn, leaveTxt]);
    } else {
      const desc = this.add.text(
        0,
        -10,
        `"Magnificent! You carry all 4 Regional Badges: Meadow, Azure, Grove, and Magma!\n\nStep forward and face my supreme 3v3 Apex team for the Crown!"`,
        {
          fontSize: '10px',
          color: '#f8fafc',
          align: 'center',
          wordWrap: { width: 300 }
        }
      ).setOrigin(0.5);

      const challengeBtn = this.add.rectangle(-65, 52, 120, 28, 0xd97706)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.startChampionBattle());

      const challengeTxt = this.add.text(-65, 52, '⚔️ Challenge (3v3)', {
        fontSize: '10px',
        color: '#fff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const leaveBtn = this.add.rectangle(75, 52, 90, 28, 0x475569)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.championPromptContainer?.destroy();
          this.championPromptContainer = undefined;
        });

      const leaveTxt = this.add.text(75, 52, 'Leave', {
        fontSize: '10px',
        color: '#fff'
      }).setOrigin(0.5);

      this.championPromptContainer.add([bg, title, desc, challengeBtn, challengeTxt, leaveBtn, leaveTxt]);
    }
  }

  private startChampionBattle() {
    this.championPromptContainer?.destroy();
    this.championPromptContainer = undefined;

    Sound.playWiggle();
    this.cameras.main.flash(400, 245, 158, 11);

    const playerParty = this.getPlayerParty();

    // 3v3 Stage-3 Champion Team with PP
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
    ].map(m => {
      const movePp: Record<string, number> = {};
      m.moves.forEach(mId => {
        if (MOVES[mId]) movePp[mId] = MOVES[mId].maxPp;
      });
      return { ...m, movePp, status: null };
    });

    this.time.delayedCall(450, () => {
      this.scene.start('BattleScene', {
        playerParty,
        isTrainerBattle: true,
        trainerName: 'Master Aaron',
        trainerParty: championTeam,
        badgeReward: {
          id: 'crown',
          name: 'Crown Badge',
          leader: 'Grand Champion Aaron'
        },
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

        // Ground Layer
        const ground = layers.ground[idx];
        const h = (x * 19 + y * 37) % 100;

        if (ground === 1) {
          // Lush Meadow Grass (Base: #3ca65d)
          gfx.fillStyle(0x3ca65d, 1);
          gfx.fillRect(px, py, this.tileSize, this.tileSize);

          // Procedural grass blade tufts
          if (h < 25) {
            gfx.fillStyle(0x2d8a4e, 1);
            gfx.fillRect(px + 4, py + 5, 2, 4);
            gfx.fillRect(px + 9, py + 8, 2, 3);
          } else if (h < 45) {
            gfx.fillStyle(0x4ade80, 1);
            gfx.fillRect(px + 7, py + 3, 2, 3);
          } else if (h >= 90 && h < 95) {
            // Wild daisy (white petals + golden yellow center)
            gfx.fillStyle(0xffffff, 1);
            gfx.fillRect(px + 5, py + 6, 4, 4);
            gfx.fillStyle(0xfbbf24, 1);
            gfx.fillRect(px + 6, py + 7, 2, 2);
          } else if (h >= 95) {
            // Wild rose/poppy (crimson petals + gold center)
            gfx.fillStyle(0xf43f5e, 1);
            gfx.fillRect(px + 8, py + 7, 4, 4);
            gfx.fillStyle(0xfde047, 1);
            gfx.fillRect(px + 9, py + 8, 2, 2);
          }
        } else if (ground === 2) {
          // Cobblestone / Flagstone Path (Earthen base with individual stone pavers)
          gfx.fillStyle(0x9a6b43, 1); // Mortar shadow base
          gfx.fillRect(px, py, this.tileSize, this.tileSize);

          // Paver 1 (Top-Left)
          gfx.fillStyle(0xd4a373, 1);
          gfx.fillRect(px + 1, py + 1, 6, 6);
          gfx.fillStyle(0xfaedcd, 1);
          gfx.fillRect(px + 2, py + 2, 3, 2); // Highlight

          // Paver 2 (Top-Right)
          gfx.fillStyle(0xbc8a5f, 1);
          gfx.fillRect(px + 8, py + 1, 7, 6);
          gfx.fillStyle(0xfaedcd, 1);
          gfx.fillRect(px + 9, py + 2, 4, 2);

          // Paver 3 (Bottom-Left)
          gfx.fillStyle(0xbc8a5f, 1);
          gfx.fillRect(px + 1, py + 8, 7, 7);
          gfx.fillStyle(0xfaedcd, 1);
          gfx.fillRect(px + 2, py + 9, 4, 2);

          // Paver 4 (Bottom-Right)
          gfx.fillStyle(0xd4a373, 1);
          gfx.fillRect(px + 9, py + 8, 6, 7);
          gfx.fillStyle(0xfaedcd, 1);
          gfx.fillRect(px + 10, py + 9, 3, 2);
        } else if (ground === 6) {
          // Pallet Plaza Heal Pad (Revitalize Spot at 5, 4)
          gfx.fillStyle(0xf1f5f9, 1); // Clean clinic tile
          gfx.fillRect(px, py, this.tileSize, this.tileSize);

          // Circular heal pad base
          gfx.fillStyle(0x38bdf8, 1);
          gfx.fillCircle(px + 8, py + 8, 7);
          gfx.fillStyle(0x0284c7, 1);
          gfx.fillCircle(px + 8, py + 8, 5);

          // Medical heart / cross center
          gfx.fillStyle(0xffffff, 1);
          gfx.fillRect(px + 7, py + 5, 2, 6);
          gfx.fillRect(px + 5, py + 7, 6, 2);
        } else if (ground === 7) {
          // Dojo Tatami / Courtyard Arena
          gfx.fillStyle(0xd97706, 1); // Amber tatami base
          gfx.fillRect(px, py, this.tileSize, this.tileSize);
          gfx.fillStyle(0xb45309, 1); // Tatami inner seam
          gfx.fillRect(px + 1, py + 1, this.tileSize - 2, this.tileSize - 2);
          gfx.fillStyle(0xfbbf24, 0.35);
          gfx.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
        } else {
          gfx.fillStyle(0x3ca65d, 1);
          gfx.fillRect(px, py, this.tileSize, this.tileSize);
        }

        // Tall Grass Layer (3)
        if (layers.tallGrass[idx] === 3) {
          // Deep shadowed base
          gfx.fillStyle(0x14532d, 1);
          gfx.fillRect(px + 1, py + 2, this.tileSize - 2, this.tileSize - 3);

          // Mid green thick blade tufts
          gfx.fillStyle(0x166534, 1);
          gfx.fillRect(px + 2, py + 4, 3, 9);
          gfx.fillRect(px + 7, py + 3, 3, 10);
          gfx.fillRect(px + 11, py + 5, 3, 8);

          // Bright sunlit tips
          gfx.fillStyle(0x22c55e, 1);
          gfx.fillRect(px + 3, py + 2, 2, 4);
          gfx.fillRect(px + 8, py + 1, 2, 5);
          gfx.fillRect(px + 12, py + 3, 2, 4);

          // Vivid highlight tips
          gfx.fillStyle(0x86efac, 1);
          gfx.fillRect(px + 3, py + 1, 1, 2);
          gfx.fillRect(px + 8, py + 0, 1, 2);
          gfx.fillRect(px + 12, py + 2, 1, 2);
        }

        // Collision Obstacles & Water Layer
        const col = layers.collision[idx];
        if (col === 4) {
          // Deep Azure Water
          gfx.fillStyle(0x1e40af, 1); // Dark water depth
          gfx.fillRect(px, py, this.tileSize, this.tileSize);
          gfx.fillStyle(0x2563eb, 1); // Vibrant water surface
          gfx.fillRect(px, py + 1, this.tileSize, this.tileSize - 2);

          // Wave Specular Ripples
          const wavePhase = (x + y) % 3;
          gfx.fillStyle(0x93c5fd, 0.9);
          if (wavePhase === 0) {
            gfx.fillRect(px + 3, py + 4, 6, 1);
            gfx.fillRect(px + 8, py + 10, 5, 1);
          } else if (wavePhase === 1) {
            gfx.fillRect(px + 5, py + 6, 6, 1);
            gfx.fillRect(px + 2, py + 12, 4, 1);
          } else {
            gfx.fillRect(px + 2, py + 3, 7, 1);
            gfx.fillRect(px + 9, py + 8, 5, 1);
          }
        } else if (col === 5) {
          // Multi-tiered 16-bit Tree
          // Grass base under tree
          gfx.fillStyle(0x3ca65d, 1);
          gfx.fillRect(px, py, this.tileSize, this.tileSize);

          // Trunk & Root Shadow
          gfx.fillStyle(0x451a03, 1); // Trunk shadow
          gfx.fillRect(px + 6, py + 9, 5, 7);
          gfx.fillStyle(0x78350f, 1); // Trunk bark
          gfx.fillRect(px + 7, py + 9, 3, 6);

          // Dark canopy under-shadow
          gfx.fillStyle(0x14532d, 1);
          gfx.fillCircle(px + 8, py + 7, 7);

          // Main leafy foliage canopy
          gfx.fillStyle(0x166534, 1);
          gfx.fillCircle(px + 8, py + 6, 6);

          // Sunlit upper-left foliage highlight
          gfx.fillStyle(0x22c55e, 1);
          gfx.fillCircle(px + 6, py + 4, 4);

          // Top glint
          gfx.fillStyle(0x86efac, 0.8);
          gfx.fillCircle(px + 6, py + 3, 2);
        }
      }
    }

    // --- Pallet Plaza Pokémon Center Clinic Architecture ---
    this.renderPokemonCenter(gfx);

    // --- Pallet Plaza Town Fountain ---
    this.renderTownFountain(gfx);

    // --- Lake Azure Wooden Pier ---
    this.renderLakePier(gfx);

    // --- Ancient Fairy Shrine ---
    this.renderFairyShrine(gfx);

    // --- Ember Crags Volcano Caldera ---
    this.renderVolcanoCaldera(gfx);

    // --- Dojo Pagoda Gym Architecture ---
    this.renderDojoPagoda(gfx);
  }

  private renderPokemonCenter(gfx: Phaser.GameObjects.Graphics) {
    // Clinic sits behind Heal Pad (10, 8): covering x: 8 to 12, y: 5 to 7
    const startX = 8 * this.tileSize;
    const startY = 5 * this.tileSize;
    const bWidth = 5 * this.tileSize; // 80px

    // Main Gable Roof (Crimson red shingles with white verge)
    gfx.fillStyle(0xb91c1c, 1); // Roof shadow underlay
    gfx.fillRect(startX, startY, bWidth, 24);
    gfx.fillStyle(0xdc2626, 1); // Bright red shingles
    gfx.fillRect(startX + 2, startY + 2, bWidth - 4, 20);

    // Roof Shingle Lines
    gfx.fillStyle(0x991b1b, 1);
    gfx.fillRect(startX + 4, startY + 8, bWidth - 8, 1);
    gfx.fillRect(startX + 4, startY + 15, bWidth - 8, 1);

    // White Roof Trimming
    gfx.fillStyle(0xffffff, 1);
    gfx.fillRect(startX, startY + 22, bWidth, 3);
    gfx.fillRect(startX + bWidth / 2 - 12, startY, 24, 2);

    // Clinic Facade Walls (Off-white medical siding)
    const wallY = startY + 25;
    const wallH = 20;
    gfx.fillStyle(0xe2e8f0, 1); // Wall shadow
    gfx.fillRect(startX + 2, wallY, bWidth - 4, wallH);
    gfx.fillStyle(0xf8fafc, 1); // Pristine wall
    gfx.fillRect(startX + 4, wallY, bWidth - 8, wallH - 1);

    // Cyan Windows
    gfx.fillStyle(0x0284c7, 1);
    gfx.fillRect(startX + 8, wallY + 3, 14, 12);
    gfx.fillRect(startX + bWidth - 22, wallY + 3, 14, 12);
    gfx.fillStyle(0x38bdf8, 1);
    gfx.fillRect(startX + 9, wallY + 4, 12, 10);
    gfx.fillRect(startX + bWidth - 21, wallY + 4, 12, 10);
    // Window gleam
    gfx.fillStyle(0xffffff, 0.8);
    gfx.fillRect(startX + 10, wallY + 5, 4, 3);
    gfx.fillRect(startX + bWidth - 20, wallY + 5, 4, 3);

    // Clinic Sign Plaque with Red Cross / Heart Emblem
    const signX = startX + bWidth / 2 - 12;
    const signY = wallY - 6;
    gfx.fillStyle(0x1e293b, 1);
    gfx.fillRect(signX - 1, signY - 1, 26, 14);
    gfx.fillStyle(0xffffff, 1);
    gfx.fillRect(signX, signY, 24, 12);
    // Red medical cross
    gfx.fillStyle(0xef4444, 1);
    gfx.fillRect(signX + 10, signY + 2, 4, 8);
    gfx.fillRect(signX + 7, signY + 4, 10, 4);

    // Doorway frame right above Revitalize Pad at (10, 8)
    const doorX = 10 * this.tileSize;
    gfx.fillStyle(0x0f172a, 1);
    gfx.fillRect(doorX + 1, wallY + 6, 14, 14);
    gfx.fillStyle(0x38bdf8, 0.7);
    gfx.fillRect(doorX + 2, wallY + 7, 5, 13);
    gfx.fillRect(doorX + 9, wallY + 7, 5, 13);

    // Clinic Name Sign Text
    this.add.text(startX + bWidth / 2, startY + 4, '🏥 CLINIC', {
      fontSize: '8px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(4);

    // Pulsing Revitalize Beacon over Heal Pad at (10, 8)
    const hx = 10 * this.tileSize + 8;
    const hy = 8 * this.tileSize + 8;
    const beacon = this.add.circle(hx, hy, 9).setStrokeStyle(1.5, 0x38bdf8, 0.8).setDepth(3);
    this.tweens.add({
      targets: beacon,
      scale: 1.45,
      alpha: 0.15,
      duration: 1000,
      repeat: -1
    });

    const floatingHeart = this.add.text(hx, hy - 4, '💖', { fontSize: '9px' }).setOrigin(0.5).setDepth(4);
    this.tweens.add({
      targets: floatingHeart,
      y: hy - 8,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private renderTownFountain(gfx: Phaser.GameObjects.Graphics) {
    // Pallet Plaza Fountain at (10, 12)
    const fx = 10 * this.tileSize + 8;
    const fy = 12 * this.tileSize + 8;

    // Stone fountain basin
    gfx.fillStyle(0x475569, 1);
    gfx.fillCircle(fx, fy, 11);
    gfx.fillStyle(0x64748b, 1);
    gfx.fillCircle(fx, fy, 10);
    // Clear blue water pool
    gfx.fillStyle(0x0284c7, 1);
    gfx.fillCircle(fx, fy, 8);
    gfx.fillStyle(0x38bdf8, 0.85);
    gfx.fillCircle(fx, fy, 6);
    // Center fountain nozzle / pedestal
    gfx.fillStyle(0x94a3b8, 1);
    gfx.fillCircle(fx, fy, 3);

    // Water jet particles
    const spray1 = this.add.circle(fx, fy - 1, 1.5, 0xffffff, 0.8).setDepth(5);
    const spray2 = this.add.circle(fx + 2, fy, 1.2, 0xe0f2fe, 0.7).setDepth(5);
    this.tweens.add({
      targets: [spray1, spray2],
      y: '-=5',
      alpha: 0.2,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private renderLakePier(gfx: Phaser.GameObjects.Graphics) {
    // Pier spans x: 13..15, y: 24..28
    const px = 13 * this.tileSize;
    const py = 24 * this.tileSize;
    const pw = 3 * this.tileSize;
    const ph = 5 * this.tileSize;

    // Wooden deck slats
    gfx.fillStyle(0x78350f, 1); // Dark timber base
    gfx.fillRect(px, py, pw, ph);

    for (let y = py; y < py + ph; y += 4) {
      gfx.fillStyle(0x92400e, 1); // Light plank
      gfx.fillRect(px + 1, y, pw - 2, 3);
      gfx.fillStyle(0x451a03, 1); // Seam
      gfx.fillRect(px, y + 3, pw, 1);
    }

    // Wooden edge railing / posts
    [py, py + 16, py + 32, py + ph - 2].forEach(postY => {
      gfx.fillStyle(0x451a03, 1);
      gfx.fillRect(px, postY, 2, 3);
      gfx.fillRect(px + pw - 2, postY, 2, 3);
    });

    // Pier end bollard
    gfx.fillStyle(0xb45309, 1);
    gfx.fillCircle(px + pw / 2, py + ph - 2, 3);
  }

  private renderFairyShrine(gfx: Phaser.GameObjects.Graphics) {
    // Old Grove Fairy Shrine at (38, 38)
    const sx = 38 * this.tileSize + 8;
    const sy = 38 * this.tileSize + 8;

    // Glowing mystical circle
    gfx.fillStyle(0xc084fc, 0.25);
    gfx.fillCircle(sx, sy, 14);
    gfx.lineStyle(1.5, 0xe879f9, 0.8);
    gfx.strokeCircle(sx, sy, 12);

    // Ancient rune glyphs
    gfx.fillStyle(0xfdf4ff, 0.9);
    gfx.fillRect(sx - 4, sy - 1, 8, 2);
    gfx.fillRect(sx - 1, sy - 4, 2, 8);

    // Floating fairy spark
    const spark = this.add.text(sx, sy - 2, '✨', { fontSize: '10px' }).setOrigin(0.5).setDepth(5);
    this.tweens.add({
      targets: spark,
      y: sy - 8,
      scale: 1.25,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private renderVolcanoCaldera(gfx: Phaser.GameObjects.Graphics) {
    // Lava Caldera at x: 62..68, y: 6..10
    const vx = 62 * this.tileSize;
    const vy = 6 * this.tileSize;
    const vw = 7 * this.tileSize;
    const vh = 5 * this.tileSize;

    // Basalt rim shadow
    gfx.fillStyle(0x1c1917, 1);
    gfx.fillRect(vx, vy, vw, vh);

    // Molten magma surface
    gfx.fillStyle(0xd97706, 1);
    gfx.fillRect(vx + 2, vy + 2, vw - 4, vh - 4);
    gfx.fillStyle(0xef4444, 0.9);
    gfx.fillRect(vx + 4, vy + 4, vw - 8, vh - 8);
    gfx.fillStyle(0xfde047, 0.8);
    gfx.fillCircle(vx + vw / 2, vy + vh / 2, 10);

    // Steam / smoke wisps
    const smoke = this.add.circle(vx + vw / 2, vy + vh / 2, 4, 0xfca5a5, 0.4).setDepth(6);
    this.tweens.add({
      targets: smoke,
      y: '-=16',
      scale: 2.2,
      alpha: 0,
      duration: 1400,
      repeat: -1
    });
  }

  private renderDojoPagoda(gfx: Phaser.GameObjects.Graphics) {
    // Dojo Pagoda gym facade at x: 64 to 72, y: 39 to 41
    const startX = 64 * this.tileSize;
    const startY = 39 * this.tileSize;
    const bWidth = 9 * this.tileSize; // 144px

    // Pagoda Crimson & Gold Eaves Roof
    gfx.fillStyle(0x78350f, 1); // Eave under-shadow
    gfx.fillRect(startX, startY + 2, bWidth, 20);
    gfx.fillStyle(0x991b1b, 1); // Imperial crimson tiles
    gfx.fillRect(startX + 2, startY + 4, bWidth - 4, 16);

    // Golden Roof Ridge & Upturned Finials
    gfx.fillStyle(0xf59e0b, 1);
    gfx.fillRect(startX - 4, startY + 1, 8, 5);
    gfx.fillRect(startX + bWidth - 4, startY + 1, 8, 5);
    gfx.fillRect(startX + bWidth / 2 - 16, startY, 32, 4); // Center ridge

    // Sturdy Martial Timber Pillars
    const pillarY = startY + 20;
    const pillarH = 26;
    [startX + 4, startX + 36, startX + bWidth - 40, startX + bWidth - 8].forEach((px) => {
      gfx.fillStyle(0x451a03, 1);
      gfx.fillRect(px, pillarY, 6, pillarH);
      gfx.fillStyle(0x78350f, 1);
      gfx.fillRect(px + 1, pillarY, 4, pillarH);
      gfx.fillStyle(0xd97706, 1); // Gold base trim
      gfx.fillRect(px, pillarY + pillarH - 3, 6, 3);
    });

    // Dojo Gym Banner Text
    this.add.text(startX + bWidth / 2, startY + 11, '🥋 GRAND PAGODA DOJO', {
      fontSize: '9px',
      color: '#fef08a',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(4);
  }

  private renderSignposts() {
    this.signposts.forEach((sign) => {
      const sx = sign.x * this.tileSize + 8;
      const sy = sign.y * this.tileSize + 8;

      // Wooden post + sign board graphic
      const postGfx = this.add.graphics().setDepth(7);
      // Post
      postGfx.fillStyle(0x451a03, 1);
      postGfx.fillRect(sx - 2, sy + 1, 4, 7);
      // Board
      postGfx.fillStyle(0xb45309, 1);
      postGfx.fillRoundedRect(sx - 6, sy - 6, 12, 9, 2);
      postGfx.lineStyle(1, 0x78350f, 1);
      postGfx.strokeRoundedRect(sx - 6, sy - 6, 12, 9, 2);
      // Lettering markings
      postGfx.fillStyle(0xfef08a, 0.9);
      postGfx.fillRect(sx - 4, sy - 4, 8, 1.5);
      postGfx.fillRect(sx - 4, sy - 1, 5, 1.5);

      // Interactive hit zone
      const hitZone = this.add.zone(sx, sy, 16, 16).setInteractive({ useHandCursor: true }).setDepth(8);
      hitZone.on('pointerdown', () => {
        this.showSignDialog(sign);
      });
    });
  }

  private showSignDialog(sign: Signpost) {
    if (this.signDialogContainer) {
      this.signDialogContainer.destroy();
      this.signDialogContainer = undefined;
    }

    Sound.playWiggle();
    this.signDialogContainer = this.add.container(240, 160).setScrollFactor(0).setDepth(300);

    const bg = this.add.rectangle(0, 0, 320, 130, 0x0f172a, 0.96).setStrokeStyle(2, 0xd97706);
    const headerBg = this.add.rectangle(0, -42, 316, 26, 0x78350f);
    const title = this.add.text(0, -42, sign.title, {
      fontSize: '11px',
      color: '#fef08a',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const body = this.add.text(0, 0, sign.text, {
      fontSize: '10px',
      color: '#f1f5f9',
      align: 'center',
      lineSpacing: 5
    }).setOrigin(0.5);

    const closeBtn = this.add.rectangle(0, 42, 80, 24, 0x334155)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.signDialogContainer?.destroy();
        this.signDialogContainer = undefined;
      });

    const closeTxt = this.add.text(0, 42, 'Close', {
      fontSize: '10px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.signDialogContainer.add([bg, headerBg, title, body, closeBtn, closeTxt]);
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

  private setupCompanion() {
    const party = this.getPlayerParty();
    const leadMon = party[0];
    if (!leadMon) return;

    if (this.companionSprite) {
      this.companionSprite.destroy();
      this.companionSprite = undefined;
    }
    if (this.companionShadow) {
      this.companionShadow.destroy();
      this.companionShadow = undefined;
    }

    // Position companion 1 tile behind player depending on facing direction
    let behindX = this.playerTile.x;
    let behindY = this.playerTile.y;
    if (this.facing === 'down') behindY -= 1;
    else if (this.facing === 'up') behindY += 1;
    else if (this.facing === 'left') behindX += 1;
    else if (this.facing === 'right') behindX -= 1;

    const width = this.mapData?.width ?? 80;
    const height = this.mapData?.height ?? 60;
    behindX = Phaser.Math.Clamp(behindX, 0, width - 1);
    behindY = Phaser.Math.Clamp(behindY, 0, height - 1);

    this.companionTile = { x: behindX, y: behindY };
    const cx = this.companionTile.x * this.tileSize + 8;
    const cy = this.companionTile.y * this.tileSize + 8;

    this.companionShadow = this.add.ellipse(cx, cy + 5, 11, 5, 0x000000, 0.35).setDepth(8);
    this.companionSprite = this.add.image(cx, cy - 2, `monster-${leadMon.speciesId}`)
      .setScale(0.52)
      .setDepth(9)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.interactWithCompanion());
  }

  public refreshCompanion() {
    const party = this.getPlayerParty();
    const leadMon = party[0];
    if (!leadMon) {
      if (this.companionSprite) this.companionSprite.setVisible(false);
      if (this.companionShadow) this.companionShadow.setVisible(false);
      return;
    }
    if (this.companionSprite) {
      this.companionSprite.setTexture(`monster-${leadMon.speciesId}`);
      this.companionSprite.setVisible(true);
    } else {
      this.setupCompanion();
    }
    if (this.companionShadow) this.companionShadow.setVisible(true);
  }

  private interactWithCompanion() {
    const party = this.getPlayerParty();
    const leadMon = party[0];
    if (!leadMon || !this.companionSprite) return;

    Sound.playWiggle();

    // Joyful hop
    this.tweens.killTweensOf(this.companionSprite);
    const baseX = this.companionTile.x * this.tileSize + 8;
    const baseY = this.companionTile.y * this.tileSize + 8 - 2;
    this.companionSprite.setPosition(baseX, baseY);

    this.tweens.add({
      targets: this.companionSprite,
      y: baseY - 6,
      yoyo: true,
      duration: 150,
      repeat: 1,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.companionSprite?.setPosition(baseX, baseY);
      }
    });

    const moods = [
      `💖 ${leadMon.nickname} happily bobs along with you!`,
      `✨ ${leadMon.nickname} nudges your side with affection!`,
      `🐾 ${leadMon.nickname} looks energized and ready for battle!`,
      `🌟 ${leadMon.nickname} spins in a joyful circle!`,
      `🥰 ${leadMon.nickname} looks up at you with sparkling eyes!`
    ];
    const mood = Phaser.Utils.Array.GetRandom(moods);
    this.logText.setText(mood);
  }

  private getPlayerParty(): MonsterInstance[] {
    const raw = localStorage.getItem('monster_proto_party');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: any, idx: number) => {
            const spec = getSpecies(m.speciesId || 1);
            const lvl = Math.max(1, m.level || 5);
            const maxHp = m.maxHp || calculateMaxHp(spec.baseStats.hp, lvl);
            const moves = Array.isArray(m.moves) && m.moves.length > 0 ? m.moves : getDefaultMoves(spec, lvl);
            const movePp: Record<string, number> = { ...(m.movePp || {}) };
            moves.forEach((mId: string) => {
              if (typeof movePp[mId] !== 'number' && MOVES[mId]) {
                movePp[mId] = MOVES[mId].maxPp;
              }
            });
            return {
              ...m,
              moves,
              movePp,
              status: m.status || null,
              partySlot: idx
            };
          });
        }
      } catch {}
    }
    const starterSpecies = getSpecies(1);
    const maxHp = calculateMaxHp(starterSpecies.baseStats.hp, 5);
    const starterMoves = ['tackle', 'ember_nip'];
    const starterPp: Record<string, number> = {};
    starterMoves.forEach(mId => {
      if (MOVES[mId]) starterPp[mId] = MOVES[mId].maxPp;
    });

    const starter: MonsterInstance = {
      id: 'starter-1',
      speciesId: 1,
      nickname: 'Emberpup',
      level: 5,
      xp: 0,
      currentHp: maxHp,
      maxHp,
      moves: starterMoves,
      movePp: starterPp,
      status: null,
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
      mon.status = null;
      if (!mon.movePp) mon.movePp = {};
      mon.moves.forEach((mId) => {
        if (MOVES[mId]) mon.movePp![mId] = MOVES[mId].maxPp;
      });
    });
    try {
      localStorage.setItem('monster_proto_party', JSON.stringify(party));
    } catch {}
    Sound.playRevitalize();
    if (this.logText && this.logText.active) {
      this.logText.setText('💖 Revitalized! HP, PP, and Status completely restored!');
    }
    if (this.cameras?.main) {
      this.cameras.main.flash(300, 50, 205, 50);
    }

    const toast = document.getElementById('save-toast');
    if (toast) {
      toast.innerText = '💖 Team Revitalized: Full HP, PP & Status!';
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
