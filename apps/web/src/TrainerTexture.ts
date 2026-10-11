import Phaser from 'phaser';

// High-Detail Gen 3/4 Style Pixel Art Trainer Generator
// Produces 12 overworld animation frames (20x28) and 3 battle back-sprites (32x38)
export function createTrainerTextures(scene: Phaser.Scene) {
  if (scene.textures.exists('trainer-down-0')) return;

  type PixelGrid = string[];

  // 16-Bit Color Palette
  const COLOR_MAP: Record<string, string> = {
    R: '#ef4444', // Red cap / jacket primary
    D: '#b91c1c', // Dark red shadow
    C: '#7f1d1d', // Deep red contour
    W: '#ffffff', // White cap emblem / collar / shoe
    G: '#cbd5e1', // Light gray shadow
    S: '#fed7aa', // Peach skin tone
    T: '#fba374', // Skin shadow / tan
    B: '#451a03', // Dark brown hair
    H: '#78350f', // Hair highlight
    E: '#0f172a', // Eye dark / outline
    K: '#1e293b', // Backpack dark slate
    M: '#334155', // Backpack mid slate
    Y: '#f59e0b', // Gold backpack strap / buckle
    P: '#2563eb', // Denim jeans blue
    L: '#1d4ed8', // Dark denim crease
    F: '#f8fafc', // Sneaker white
    X: '#dc2626', // Sneaker red accent
    Z: '#0f172a'  // Sneaker black sole
  };

  const drawFrame = (key: string, width: number, height: number, grid: PixelGrid) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    for (let y = 0; y < height; y++) {
      const row = grid[y] || '';
      for (let x = 0; x < width; x++) {
        const char = row[x] || '.';
        if (char !== '.' && COLOR_MAP[char]) {
          ctx.fillStyle = COLOR_MAP[char];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    scene.textures.addCanvas(key, canvas);
  };

  const OW_W = 20;
  const OW_H = 28;

  // ==========================================
  // 1. OVERWORLD: FACING DOWN (FRONT)
  // ==========================================
  const downIdle: PixelGrid = [
    '.......RRRRRR.......', // 0
    '.....RRRDDDDDRR.....', // 1
    '....RRRDDDDDDDRR....', // 2
    '...RRRWWWWWWWWDDR...', // 3
    '..RRRWWWWWWWWWWDDR..', // 4 - Cap dome
    '..RRRWWWWWWWWWWDDR..', // 5
    '.RRRRRRRRRRRRRRRRRD.', // 6 - Cap visor
    '.RDDDDDDDDDDDDDDDDD.', // 7 - Visor underside shadow
    '...BBSSSSSSSSSSBB...', // 8 - Hair fringe & face
    '...BBSEEESSSSEEBB...', // 9 - Eyes
    '...BBSWEESSSWEESB...', // 10 - Eye catchlights
    '....SSSSSTTSSSSS....', // 11
    '.....SSSTTTTSSS.....', // 12 - Chin & neck
    '....WWWWWWWWWWWW....', // 13 - White jacket collar
    '...RRYJJJJJJJJYRR...', // 14 - Red jacket, yellow straps
    '..RRRYJJJJJJJJYRRR..', // 15
    '..SSRYJJJJJJJJYRSS..', // 16 - Hands
    '..SSRYJJJJJJJJYRSS..', // 17
    '...KKJJJJJJJJJJKK...', // 18 - Backpack sides
    '....KKKKKKKKKKKK....', // 19 - Belt/bottom
    '.....PPPP..PPPP.....', // 20 - Denim jeans
    '.....PPPP..PPPP.....', // 21
    '.....LLLL..LLLL.....', // 22 - Denim shadow
    '.....LLLL..LLLL.....', // 23
    '....FFFFF..FFFFF....', // 24 - Sneakers
    '....FXXXF..FXXXF....', // 25
    '....FXXXF..FXXXF....', // 26
    '....ZZZZZ..ZZZZZ....'  // 27 - Soles
  ];

  const downStep1: PixelGrid = [
    '.......RRRRRR.......',
    '.....RRRDDDDDRR.....',
    '....RRRDDDDDDDRR....',
    '...RRRWWWWWWWWDDR...',
    '..RRRWWWWWWWWWWDDR..',
    '..RRRWWWWWWWWWWDDR..',
    '.RRRRRRRRRRRRRRRRRD.',
    '.RDDDDDDDDDDDDDDDDD.',
    '...BBSSSSSSSSSSBB...',
    '...BBSEEESSSSEEBB...',
    '...BBSWEESSSWEESB...',
    '....SSSSSTTSSSSS....',
    '.....SSSTTTTSSS.....',
    '....WWWWWWWWWWWW....',
    '...RRYJJJJJJJJYRR...',
    '..RRRYJJJJJJJJYRRR..',
    '..SSRYJJJJJJJJYRSS..',
    '...RRYJJJJJJJJYRR...',
    '....KKJJJJJJJJ KK...',
    '.....KKKKKKKKKK.....',
    '....PPPPP..PPPP.....', // Left leg forward
    '....PPPPP..PPPP.....',
    '....LLLLL..LLLL.....',
    '....LLLLL...LLL.....',
    '...FFFFFF...........',
    '...FXXXXF..FFFFF....',
    '...FXXXXF..FXXXF....',
    '...ZZZZZZ..ZZZZZ....'
  ];

  const downStep2: PixelGrid = [
    '.......RRRRRR.......',
    '.....RRRDDDDDRR.....',
    '....RRRDDDDDDDRR....',
    '...RRRWWWWWWWWDDR...',
    '..RRRWWWWWWWWWWDDR..',
    '..RRRWWWWWWWWWWDDR..',
    '.RRRRRRRRRRRRRRRRRD.',
    '.RDDDDDDDDDDDDDDDDD.',
    '...BBSSSSSSSSSSBB...',
    '...BBSEEESSSSEEBB...',
    '...BBSWEESSSWEESB...',
    '....SSSSSTTSSSSS....',
    '.....SSSTTTTSSS.....',
    '....WWWWWWWWWWWW....',
    '...RRYJJJJJJJJYRR...',
    '..RRRYJJJJJJJJYRRR..',
    '..SSRYJJJJJJJJYRSS..',
    '...RRYJJJJJJJJYRR...',
    '...KK JJJJJJJJKK....',
    '.....KKKKKKKKKK.....',
    '.....PPPP..PPPPP....', // Right leg forward
    '.....PPPP..PPPPP....',
    '.....LLLL..LLLLL....',
    '.....LLL...LLLLL....',
    '...........FFFFFF...',
    '....FFFFF..FXXXXF...',
    '....FXXXF..FXXXXF...',
    '....ZZZZZ..ZZZZZZ...'
  ];

  // ==========================================
  // 2. OVERWORLD: FACING UP (BACK)
  // ==========================================
  const upIdle: PixelGrid = [
    '.......RRRRRR.......',
    '.....RRRDDDDDRR.....',
    '....RRRDDDDDDDRR....',
    '...RRRDDDDDDDDDDR...',
    '..RRRRDDDDDDDDDDRR..',
    '..RRRRDDDDDDDDDDRR..',
    '..RRRRDDDDDDDDDDRR..',
    '...BBBBBBBBBBBBBB...', // Back of hair
    '...BBBBBBBBBBBBBB...',
    '....BBBBBBBBBBBB....',
    '.....BBBBBBBBBB.....',
    '......TTTTTTTT......',
    '....WWWWWWWWWWWW....', // Collar
    '...RRKKKKKKKKKKRR...', // Big backpack
    '..RRKKKKKKKKKKKKRR..',
    '..RRKMMMMMMMMMMKRR..',
    '..SSKMMMMMMMMMMKSS..',
    '..SSKKKKKKKKKKKKSS..',
    '...KKYYYYYYYYYYKK...',
    '....KKKKKKKKKKKK....',
    '.....PPPP..PPPP.....',
    '.....PPPP..PPPP.....',
    '.....LLLL..LLLL.....',
    '.....LLLL..LLLL.....',
    '....FFFFF..FFFFF....',
    '....FXXXF..FXXXF....',
    '....FXXXF..FXXXF....',
    '....ZZZZZ..ZZZZZ....'
  ];

  const upStep1: PixelGrid = [
    '.......RRRRRR.......',
    '.....RRRDDDDDRR.....',
    '....RRRDDDDDDDRR....',
    '...RRRDDDDDDDDDDR...',
    '..RRRRDDDDDDDDDDRR..',
    '..RRRRDDDDDDDDDDRR..',
    '..RRRRDDDDDDDDDDRR..',
    '...BBBBBBBBBBBBBB...',
    '...BBBBBBBBBBBBBB...',
    '....BBBBBBBBBBBB....',
    '.....BBBBBBBBBB.....',
    '......TTTTTTTT......',
    '....WWWWWWWWWWWW....',
    '...RRKKKKKKKKKKRR...',
    '..RRKKKKKKKKKKKKRR..',
    '..RRKMMMMMMMMMMKRR..',
    '..SSKMMMMMMMMMMKSS..',
    '...RKKKKKKKKKKKKR...',
    '....KYYYYYYYYYYK....',
    '.....KKKKKKKKKK.....',
    '....PPPPP..PPPP.....',
    '....PPPPP..PPPP.....',
    '....LLLLL..LLLL.....',
    '....LLLLL...LLL.....',
    '...FFFFFF...........',
    '...FXXXXF..FFFFF....',
    '...FXXXXF..FXXXF....',
    '...ZZZZZZ..ZZZZZ....'
  ];

  const upStep2: PixelGrid = [
    '.......RRRRRR.......',
    '.....RRRDDDDDRR.....',
    '....RRRDDDDDDDRR....',
    '...RRRDDDDDDDDDDR...',
    '..RRRRDDDDDDDDDDRR..',
    '..RRRRDDDDDDDDDDRR..',
    '..RRRRDDDDDDDDDDRR..',
    '...BBBBBBBBBBBBBB...',
    '...BBBBBBBBBBBBBB...',
    '....BBBBBBBBBBBB....',
    '.....BBBBBBBBBB.....',
    '......TTTTTTTT......',
    '....WWWWWWWWWWWW....',
    '...RRKKKKKKKKKKRR...',
    '..RRKKKKKKKKKKKKRR..',
    '..RRKMMMMMMMMMMKRR..',
    '..SSKMMMMMMMMMMKSS..',
    '...RKKKKKKKKKKKKR...',
    '....KYYYYYYYYYYK....',
    '.....KKKKKKKKKK.....',
    '.....PPPP..PPPPP....',
    '.....PPPP..PPPPP....',
    '.....LLLL..LLLLL....',
    '.....LLL...LLLLL....',
    '...........FFFFFF...',
    '....FFFFF..FXXXXF...',
    '....FXXXF..FXXXXF...',
    '....ZZZZZ..ZZZZZZ...'
  ];

  // ==========================================
  // 3. OVERWORLD: FACING RIGHT (PROFILE)
  // ==========================================
  const rightIdle: PixelGrid = [
    '......RRRRRR........',
    '....RRRRDDDDRR......',
    '...RRRRDDDDDDD......',
    '..RRRWWWWWWDDD......',
    '..RRRWWWWWWDDDRRRRR.', // Visor extends right
    '..RRRWWWWWWDDDRRRRR.',
    '...BBBBSSSSDDDDDDDD.',
    '...BBBSEEESSSSSSSS..',
    '...BBBSWEESSSSSSSS..',
    '....BBBSSSSSSSS.....',
    '.....BBTTTTSSS......',
    '....WWWWWWWWWW......',
    '..KKKRRYJJJJJ.......',
    '.KKKKRRYJJJJJ.......',
    '.KKMMRRYJJJJJ.......',
    '.KKMMSSYJJJJJ.......', // Arm & hand
    '.KKKKSSYJJJJJ.......',
    '..KKKRRYJJJJJ.......',
    '....KKKKKKKK........',
    '......PPPPPP........',
    '......PPPPPP........',
    '......PPPPPP........',
    '......LLLLLL........',
    '......LLLLLL........',
    '.....FFFFFF.........',
    '.....FXXXXF.........',
    '.....FXXXXF.........',
    '.....ZZZZZZ.........'
  ];

  const rightStep1: PixelGrid = [
    '......RRRRRR........',
    '....RRRRDDDDRR......',
    '...RRRRDDDDDDD......',
    '..RRRWWWWWWDDD......',
    '..RRRWWWWWWDDDRRRRR.',
    '..RRRWWWWWWDDDRRRRR.',
    '...BBBBSSSSDDDDDDDD.',
    '...BBBSEEESSSSSSSS..',
    '...BBBSWEESSSSSSSS..',
    '....BBBSSSSSSSS.....',
    '.....BBTTTTSSS......',
    '....WWWWWWWWWW......',
    '..KKKRRYJJJJJ.......',
    '.KKKKRRYJJJJJ.......',
    '.KKMMRRYJJJJJ.......',
    '.KKMMSSYJJJJJ.......',
    '..KKKSSYJJJJJ.......',
    '...KKRRYJJJJJ.......',
    '....KKKKKKKK........',
    '.....PPPPPP.........',
    '....PPPP..PPP.......',
    '...PPPP....PPP......',
    '...LLLL....LLL......',
    '..LLLL......LL......',
    '.FFFFF......FFFF....',
    '.FXXXF......FXXF....',
    '.FXXXF......FXXF....',
    '.ZZZZZ......ZZZZ....'
  ];

  const rightStep2: PixelGrid = [
    '......RRRRRR........',
    '....RRRRDDDDRR......',
    '...RRRRDDDDDDD......',
    '..RRRWWWWWWDDD......',
    '..RRRWWWWWWDDDRRRRR.',
    '..RRRWWWWWWDDDRRRRR.',
    '...BBBBSSSSDDDDDDDD.',
    '...BBBSEEESSSSSSSS..',
    '...BBBSWEESSSSSSSS..',
    '....BBBSSSSSSSS.....',
    '.....BBTTTTSSS......',
    '....WWWWWWWWWW......',
    '..KKKRRYJJJJJ.......',
    '.KKKKRRYJJJJJ.......',
    '.KKMMRRYJJJJJ.......',
    '.KKMMSSYJJJJJ.......',
    '..KKKSSYJJJJJ.......',
    '...KKRRYJJJJJ.......',
    '....KKKKKKKK........',
    '......PPPPPP........',
    '....PPP..PPPP.......',
    '...PPP....PPPP......',
    '...LLL....LLLL......',
    '..LL......LLLL......',
    '.FFFF......FFFFF....',
    '.FXXF......FXXXF....',
    '.FXXF......FXXXF....',
    '.ZZZZ......ZZZZZ....'
  ];

  // Helper: Mirror grid horizontally for Left facing
  const mirrorGrid = (grid: PixelGrid): PixelGrid => {
    return grid.map(row => row.split('').reverse().join(''));
  };

  const leftIdle = mirrorGrid(rightIdle);
  const leftStep1 = mirrorGrid(rightStep1);
  const leftStep2 = mirrorGrid(rightStep2);

  // Register 12 Overworld textures (20x28)
  drawFrame('trainer-down-0', OW_W, OW_H, downIdle);
  drawFrame('trainer-down-1', OW_W, OW_H, downStep1);
  drawFrame('trainer-down-2', OW_W, OW_H, downStep2);

  drawFrame('trainer-up-0', OW_W, OW_H, upIdle);
  drawFrame('trainer-up-1', OW_W, OW_H, upStep1);
  drawFrame('trainer-up-2', OW_W, OW_H, upStep2);

  drawFrame('trainer-right-0', OW_W, OW_H, rightIdle);
  drawFrame('trainer-right-1', OW_W, OW_H, rightStep1);
  drawFrame('trainer-right-2', OW_W, OW_H, rightStep2);

  drawFrame('trainer-left-0', OW_W, OW_H, leftIdle);
  drawFrame('trainer-left-1', OW_W, OW_H, leftStep1);
  drawFrame('trainer-left-2', OW_W, OW_H, leftStep2);

  // ==========================================
  // 4. BATTLE: TRAINER BACK-SPRITES (32x38)
  // ==========================================
  const BT_W = 32;
  const BT_H = 38;

  // Back idle stance on the battle platform
  const backIdle: PixelGrid = [
    '............RRRRRRRR............',
    '..........RRRRDDDDDDRR..........',
    '........RRRRDDDDDDDDDDRR........',
    '.......RRRRDDDDDDDDDDDDRR.......',
    '......RRRRDDDDDDDDDDDDDDRR......',
    '......RRRRDDDDDDDDDDDDDDRR......',
    '......RRRRDDDDDDDDDDDDDDRR......',
    '.......BBBBBBBBBBBBBBBBBB.......',
    '.......BBBBBBBBBBBBBBBBBB.......',
    '........BBBBBBBBBBBBBBBB........',
    '.........BBBBBBBBBBBBBB.........',
    '..........TTTTTTTTTTTT..........',
    '........WWWWWWWWWWWWWWWW........',
    '......RRRRKKKKKKKKKKKKRRRR......',
    '.....RRRRKKKKKKKKKKKKKKRRRR.....',
    '....RRRRKKMMMMMMMMMMMMKKRRRR....',
    '....RRRRKKMMMMMMMMMMMMKKRRRR....',
    '....SSSSKKMMMMMMMMMMMMKKSSSS....', // Arms/Hands at sides
    '....SSSSKKKKKKKKKKKKKKKKSSSS....',
    '.....RRKKKYYYYYYYYYYYYKKKRR.....',
    '......KKKKYYYYYYYYYYYYKKKK......',
    '.......KKKKKKKKKKKKKKKKKK.......',
    '.........PPPPPP..PPPPPP.........',
    '........PPPPPPP..PPPPPPP........',
    '........PPPPPPP..PPPPPPP........',
    '........LLLLLLL..LLLLLLL........',
    '........LLLLLLL..LLLLLLL........',
    '........LLLLLLL..LLLLLLL........',
    '.......LLLLLLLL..LLLLLLLL.......',
    '.......LLLLLLLL..LLLLLLLL.......',
    '.......FFFFFFFF..FFFFFFFF.......',
    '.......FFFFFFFF..FFFFFFFF.......',
    '.......FXXXXXXF..FXXXXXXF.......',
    '.......FXXXXXXF..FXXXXXXF.......',
    '.......ZZZZZZZZ..ZZZZZZZZ.......',
    '................................',
    '................................',
    '................................'
  ];

  // Winding up throwing arm with capsule
  const backWindup: PixelGrid = [
    '............RRRRRRRR............',
    '..........RRRRDDDDDDRR..........',
    '........RRRRDDDDDDDDDDRR........',
    '.......RRRRDDDDDDDDDDDDRR.......',
    '......RRRRDDDDDDDDDDDDDDRR......',
    '......RRRRDDDDDDDDDDDDDDRR......',
    '......RRRRDDDDDDDDDDDDDDRR......',
    '.......BBBBBBBBBBBBBBBBBB.......',
    '.......BBBBBBBBBBBBBBBBBB.......',
    '........BBBBBBBBBBBBBBBB........',
    '.........BBBBBBBBBBBBBB.........',
    '..........TTTTTTTTTTTT..........',
    '...RRR..WWWWWWWWWWWWWWWW........', // Left arm raised back
    '..RRRRRRRRKKKKKKKKKKKKRRRR......',
    '..RRRRRRRKKKKKKKKKKKKKKRRRR.....',
    '..SSSS..KKMMMMMMMMMMMMKKRRRR....',
    '..SSSS..KKMMMMMMMMMMMMKKRRRR....',
    '..XXWW..KKMMMMMMMMMMMMKKSSSS....', // Holding Capsule!
    '..WWXX..KKKKKKKKKKKKKKKKSSSS....',
    '.....RRKKKYYYYYYYYYYYYKKKRR.....',
    '......KKKKYYYYYYYYYYYYKKKK......',
    '.......KKKKKKKKKKKKKKKKKK.......',
    '.........PPPPPP..PPPPPP.........',
    '........PPPPPPP..PPPPPPP........',
    '........PPPPPPP..PPPPPPP........',
    '........LLLLLLL..LLLLLLL........',
    '........LLLLLLL..LLLLLLL........',
    '........LLLLLLL..LLLLLLL........',
    '.......LLLLLLLL..LLLLLLLL.......',
    '.......LLLLLLLL..LLLLLLLL.......',
    '.......FFFFFFFF..FFFFFFFF.......',
    '.......FFFFFFFF..FFFFFFFF.......',
    '.......FXXXXXXF..FXXXXXXF.......',
    '.......FXXXXXXF..FXXXXXXF.......',
    '.......ZZZZZZZZ..ZZZZZZZZ.......',
    '................................',
    '................................',
    '................................'
  ];

  // Dynamic throw release follow-through
  const backThrow: PixelGrid = [
    '............RRRRRRRR............',
    '..........RRRRDDDDDDRR..........',
    '........RRRRDDDDDDDDDDRR........',
    '.......RRRRDDDDDDDDDDDDRR.......',
    '......RRRRDDDDDDDDDDDDDDRR......',
    '......RRRRDDDDDDDDDDDDDDRR......',
    '......RRRRDDDDDDDDDDDDDDRR......',
    '.......BBBBBBBBBBBBBBBBBB.......',
    '.......BBBBBBBBBBBBBBBBBB.......',
    '........BBBBBBBBBBBBBBBB........',
    '.........BBBBBBBBBBBBBB.........',
    '..........TTTTTTTTTTTT..........',
    '........WWWWWWWWWWWWWWWW..RRRR..', // Right arm extended forward!
    '......RRRRKKKKKKKKKKKKRRRRRRRR..',
    '.....RRRRKKKKKKKKKKKKKKRRRSSSS..',
    '....RRRRKKMMMMMMMMMMMMKK..SSSS..',
    '....RRRRKKMMMMMMMMMMMMKK........',
    '....SSSSKKMMMMMMMMMMMMKK........',
    '....SSSSKKKKKKKKKKKKKKKK........',
    '.....RRKKKYYYYYYYYYYYYKKKRR.....',
    '......KKKKYYYYYYYYYYYYKKKK......',
    '.......KKKKKKKKKKKKKKKKKK.......',
    '........PPPPPPP..PPPPPPP........',
    '.......PPPPPPPP..PPPPPPP........',
    '.......PPPPPPPP..PPPPPPP........',
    '.......LLLLLLLL..LLLLLLL........',
    '.......LLLLLLLL..LLLLLLL........',
    '.......LLLLLLLL..LLLLLLL........',
    '......LLLLLLLLL..LLLLLLLL.......',
    '......LLLLLLLLL..LLLLLLLL.......',
    '......FFFFFFFFF..FFFFFFFF.......',
    '......FFFFFFFFF..FFFFFFFF.......',
    '......FXXXXXXXF..FXXXXXXF.......',
    '......FXXXXXXXF..FXXXXXXF.......',
    '......ZZZZZZZZZ..ZZZZZZZZ.......',
    '................................',
    '................................',
    '................................'
  ];

  drawFrame('trainer-back-idle', BT_W, BT_H, backIdle);
  drawFrame('trainer-back-windup', BT_W, BT_H, backWindup);
  drawFrame('trainer-back-throw', BT_W, BT_H, backThrow);
}
