import Phaser from 'phaser';

// Procedural 16x20 Retro Trainer Pixel Art Spritesheet generator
export function createTrainerTextures(scene: Phaser.Scene) {
  if (scene.textures.exists('trainer-down-0')) return;

  const width = 16;
  const height = 20;

  type PixelGrid = string[];

  // Palette:
  // . = transparent
  // R = cap red (#dc2626)
  // D = dark cap red (#991b1b)
  // W = white (#ffffff)
  // S = skin tone (#fcd34d)
  // B = brown hair (#78350f)
  // E = eye black (#0f172a)
  // J = jacket blue/red (#ef4444)
  // K = backpack (#1e293b)
  // P = pants denim (#2563eb)
  // L = dark pants (#1d4ed8)
  // F = shoes (#f8fafc)
  // X = shoe sole (#b91c1c)

  const COLOR_MAP: Record<string, string> = {
    R: '#dc2626',
    D: '#991b1b',
    W: '#ffffff',
    S: '#fed7aa',
    B: '#78350f',
    E: '#0f172a',
    J: '#ef4444',
    K: '#1e293b',
    P: '#2563eb',
    L: '#1d4ed8',
    F: '#f8fafc',
    X: '#b91c1c'
  };

  const drawFrame = (key: string, grid: PixelGrid) => {
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

  // --- Facing DOWN (Front) ---
  const downIdle: PixelGrid = [
    '.....RRRRRR.....',
    '....RRRRRRRR....',
    '....RRWWWRRR....',
    '...DDDDDDDDDD...',
    '....BBSSSSBB....',
    '....SEEEEEES....',
    '....SSEEEESS....',
    '....SSSSSSSS....',
    '....JJWWWWJJ....',
    '...JJJWWWWJJJ...',
    '...JJJWWWWJJJ...',
    '...SJJWWWWJJS...',
    '....JJJJJJJJ....',
    '.....PPPPPP.....',
    '.....PPPPPP.....',
    '.....PP..PP.....',
    '.....PP..PP.....',
    '.....LL..LL.....',
    '....FFFFFFFF....',
    '....XXXX..XX....'
  ];

  const downStep1: PixelGrid = [
    '.....RRRRRR.....',
    '....RRRRRRRR....',
    '....RRWWWRRR....',
    '...DDDDDDDDDD...',
    '....BBSSSSBB....',
    '....SEEEEEES....',
    '....SSEEEESS....',
    '....SSSSSSSS....',
    '....JJWWWWJJ....',
    '...JJJWWWWJJJ...',
    '...JJJWWWWJJJ...',
    '...SJJWWWWJJS...',
    '....JJJJJJJJ....',
    '.....PPPPPP.....',
    '.....PPPPPP.....',
    '....PPP..PP.....',
    '....PPP..LL.....',
    '....LLL.FFFF....',
    '...FFFF.XXXX....',
    '...XXXX.........'
  ];

  const downStep2: PixelGrid = [
    '.....RRRRRR.....',
    '....RRRRRRRR....',
    '....RRWWWRRR....',
    '...DDDDDDDDDD...',
    '....BBSSSSBB....',
    '....SEEEEEES....',
    '....SSEEEESS....',
    '....SSSSSSSS....',
    '....JJWWWWJJ....',
    '...JJJWWWWJJJ...',
    '...JJJWWWWJJJ...',
    '...SJJWWWWJJS...',
    '....JJJJJJJJ....',
    '.....PPPPPP.....',
    '.....PPPPPP.....',
    '.....PP..PPP....',
    '.....LL..PPP....',
    '....FFFF.LLL....',
    '....XXXX.FFFF...',
    '.........XXXX...'
  ];

  // --- Facing UP (Back) ---
  const upIdle: PixelGrid = [
    '.....RRRRRR.....',
    '....RRRRRRRR....',
    '....RRRRRRRR....',
    '....DDDDDDDD....',
    '....BBBBBBBB....',
    '....BBBBBBBB....',
    '....BBBBBBBB....',
    '....SSSSSSSS....',
    '....KKKKKKKK....',
    '...KKKKKKKKKK...',
    '...KKKKKKKKKK...',
    '...SJJJJJJJJS...',
    '....JJJJJJJJ....',
    '.....PPPPPP.....',
    '.....PPPPPP.....',
    '.....PP..PP.....',
    '.....PP..PP.....',
    '.....LL..LL.....',
    '....FFFFFFFF....',
    '....XXXX..XX....'
  ];

  const upStep1: PixelGrid = [
    '.....RRRRRR.....',
    '....RRRRRRRR....',
    '....RRRRRRRR....',
    '....DDDDDDDD....',
    '....BBBBBBBB....',
    '....BBBBBBBB....',
    '....BBBBBBBB....',
    '....SSSSSSSS....',
    '....KKKKKKKK....',
    '...KKKKKKKKKK...',
    '...KKKKKKKKKK...',
    '...SJJJJJJJJS...',
    '....JJJJJJJJ....',
    '.....PPPPPP.....',
    '.....PPPPPP.....',
    '....PPP..PP.....',
    '....PPP..LL.....',
    '....LLL.FFFF....',
    '...FFFF.XXXX....',
    '...XXXX.........'
  ];

  const upStep2: PixelGrid = [
    '.....RRRRRR.....',
    '....RRRRRRRR....',
    '....RRRRRRRR....',
    '....DDDDDDDD....',
    '....BBBBBBBB....',
    '....BBBBBBBB....',
    '....BBBBBBBB....',
    '....SSSSSSSS....',
    '....KKKKKKKK....',
    '...KKKKKKKKKK...',
    '...KKKKKKKKKK...',
    '...SJJJJJJJJS...',
    '....JJJJJJJJ....',
    '.....PPPPPP.....',
    '.....PPPPPP.....',
    '.....PP..PPP....',
    '.....LL..PPP....',
    '....FFFF.LLL....',
    '....XXXX.FFFF...',
    '.........XXXX...'
  ];

  // --- Facing RIGHT ---
  const rightIdle: PixelGrid = [
    '.....RRRRRRR....',
    '....RRRRRRRR....',
    '....RRRRWWWR....',
    '....DDDDDDDDDD..',
    '....BBSSSSBB....',
    '....SSSEEEES....',
    '....SSSEEEES....',
    '....SSSSSSSS....',
    '...KJJWWWWJJ....',
    '..KKJJJWWWWJJ...',
    '..KKJJJWWWWJJ...',
    '..KSJJJWWWWJS...',
    '...KJJJJJJJJ....',
    '....PPPPPP......',
    '....PPPPPP......',
    '....PP..PP......',
    '....PP..PP......',
    '....LL..LL......',
    '...FFFF..FF.....',
    '...XXXX..XX.....'
  ];

  const rightStep1: PixelGrid = [
    '.....RRRRRRR....',
    '....RRRRRRRR....',
    '....RRRRWWWR....',
    '....DDDDDDDDDD..',
    '....BBSSSSBB....',
    '....SSSEEEES....',
    '....SSSEEEES....',
    '....SSSSSSSS....',
    '...KJJWWWWJJ....',
    '..KKJJJWWWWJJ...',
    '..KKJJJWWWWJJ...',
    '..KSJJJWWWWJS...',
    '...KJJJJJJJJ....',
    '....PPPPPP......',
    '....PPPPPP......',
    '...PPPP.........',
    '...LLLL...PP....',
    '..FFFFF..LLL....',
    '..XXXXX.FFFF....',
    '........XXXX....'
  ];

  const rightStep2: PixelGrid = [
    '.....RRRRRRR....',
    '....RRRRRRRR....',
    '....RRRRWWWR....',
    '....DDDDDDDDDD..',
    '....BBSSSSBB....',
    '....SSSEEEES....',
    '....SSSEEEES....',
    '....SSSSSSSS....',
    '...KJJWWWWJJ....',
    '..KKJJJWWWWJJ...',
    '..KKJJJWWWWJJ...',
    '..KSJJJWWWWJS...',
    '...KJJJJJJJJ....',
    '....PPPPPP......',
    '....PPPPPP......',
    '........PPPP....',
    '...PP...LLLL....',
    '..LLL..FFFFF....',
    '.FFFF..XXXXX....',
    '.XXXX...........'
  ];

  // --- Facing LEFT --- (Mirrored Right)
  const mirrorGrid = (grid: PixelGrid): PixelGrid => {
    return grid.map(row => row.split('').reverse().join(''));
  };

  const leftIdle = mirrorGrid(rightIdle);
  const leftStep1 = mirrorGrid(rightStep1);
  const leftStep2 = mirrorGrid(rightStep2);

  drawFrame('trainer-down-0', downIdle);
  drawFrame('trainer-down-1', downStep1);
  drawFrame('trainer-down-2', downStep2);

  drawFrame('trainer-up-0', upIdle);
  drawFrame('trainer-up-1', upStep1);
  drawFrame('trainer-up-2', upStep2);

  drawFrame('trainer-right-0', rightIdle);
  drawFrame('trainer-right-1', rightStep1);
  drawFrame('trainer-right-2', rightStep2);

  drawFrame('trainer-left-0', leftIdle);
  drawFrame('trainer-left-1', leftStep1);
  drawFrame('trainer-left-2', leftStep2);
}
