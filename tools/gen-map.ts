import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 80 x 60 tiles (4x larger map area: 1280px x 960px world!)
const width = 80;
const height = 60;

const groundData: number[] = new Array(width * height).fill(1); // Default meadow grass
const collisionData: number[] = new Array(width * height).fill(0);
const tallGrassData: number[] = new Array(width * height).fill(0);

function setTile(arr: number[], x: number, y: number, val: number) {
  if (x >= 0 && x < width && y >= 0 && y < height) {
    arr[y * width + x] = val;
  }
}

function fillRect(arr: number[], x1: number, y1: number, x2: number, y2: number, val: number) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      setTile(arr, x, y, val);
    }
  }
}

// 1. Solid Outer Perimeter (Forest & Mountain cliffs)
for (let x = 0; x < width; x++) {
  setTile(collisionData, x, 0, 5);
  setTile(collisionData, x, height - 1, 5);
}
for (let y = 0; y < height; y++) {
  setTile(collisionData, 0, y, 5);
  setTile(collisionData, width - 1, y, 5);
}

// 2. PALLET PLAZA (Safe Town: x 4..18, y 4..16)
// Town Square Paving
fillRect(groundData, 6, 6, 16, 14, 2);

// Pokémon Center Clinic at (10, 8)
setTile(groundData, 10, 8, 6); // Revitalize pad

// Town Fountain at (10, 12)
setTile(collisionData, 10, 12, 4); // Decorative fountain pool

// Town Exit Roads
// East road towards Route 1
fillRect(groundData, 16, 9, 22, 11, 2);
// South road towards Lake Azure
fillRect(groundData, 9, 14, 11, 22, 2);

// Decorative boundary trees around town
for (let y = 3; y <= 15; y++) {
  setTile(collisionData, 4, y, 5);
}
for (let x = 4; x <= 16; x++) {
  if (x < 8 || x > 12) setTile(collisionData, x, 4, 5);
}

// 3. ROUTE 1 (Meadow Trail: x 20..46, y 4..18)
// Main winding cobblestone trail
for (let x = 20; x <= 44; x++) {
  const roadY = Math.round(10 + Math.sin(x * 0.25) * 2.5);
  setTile(groundData, x, roadY, 2);
  setTile(groundData, x, roadY + 1, 2);
}

// Route 1 Tall Grass Fields
fillRect(tallGrassData, 22, 5, 30, 8, 3);
fillRect(tallGrassData, 24, 13, 34, 17, 3);
fillRect(tallGrassData, 36, 5, 42, 8, 3);
fillRect(tallGrassData, 38, 14, 44, 17, 3);

// Fences & Trees bordering Route 1
for (let x = 22; x <= 44; x += 3) {
  setTile(collisionData, x, 3, 5);
  setTile(collisionData, x, 19, 5);
}

// 4. LAKE AZURE & SUNKEN GROTTO (South-West: x 2..28, y 20..58)
// Lake Azure Body (Deep water collision)
fillRect(collisionData, 6, 26, 22, 48, 4);

// Wooden Pier extending onto the lake at x 13..15, y 24..28
fillRect(groundData, 13, 24, 15, 28, 2);
fillRect(collisionData, 13, 24, 15, 28, 0); // Pier is walkable!

// Secret Lake Island at x 13..17, y 36..40
fillRect(groundData, 13, 36, 17, 40, 1);
fillRect(collisionData, 13, 36, 17, 40, 0); // Island is land!
setTile(tallGrassData, 14, 37, 3);
setTile(tallGrassData, 16, 39, 3);

// Shallow Sandbar / Stepping stone bridge to the island
for (let y = 32; y <= 36; y++) {
  setTile(groundData, 14, y, 2);
  setTile(collisionData, 14, y, 0); // Walkable sandbar!
}
for (let x = 7; x <= 14; x++) {
  setTile(groundData, x, 32, 2);
  setTile(collisionData, x, 32, 0);
}

// Lakeside Beach & Shore Grass
for (let y = 22; y <= 50; y++) {
  setTile(tallGrassData, 5, y, 3);
  setTile(tallGrassData, 23, y, 3);
  setTile(tallGrassData, 24, y, 3);
}

// Sunken Grotto (Subterranean beach at South-West base: x 4..18, y 50..58)
fillRect(groundData, 4, 50, 20, 57, 1);
fillRect(tallGrassData, 5, 52, 18, 56, 3);
// Rocky cavern pillars
setTile(collisionData, 8, 53, 5);
setTile(collisionData, 14, 55, 5);
setTile(collisionData, 11, 51, 5);

// 5. OLD GROVE (Enchanted Woods: x 26..54, y 20..58)
// Dense labyrinth trees
for (let x = 26; x <= 52; x++) {
  for (let y = 22; y <= 56; y++) {
    // Leave pathways open, fill pockets with dense old trees
    if ((x * 13 + y * 17) % 7 === 0 && !(x >= 34 && x <= 42 && y >= 34 && y <= 42)) {
      setTile(collisionData, x, y, 5);
    } else {
      setTile(tallGrassData, x, y, 3);
    }
  }
}

// Clear Forest Pathways weaving through Old Grove
for (let y = 20; y <= 56; y++) {
  const pathX = Math.round(30 + Math.sin(y * 0.2) * 3);
  setTile(groundData, pathX, y, 2);
  setTile(collisionData, pathX, y, 0);
  setTile(tallGrassData, pathX, y, 0);
}

// Ancient Mystical Fairy Shrine at (38, 38)
fillRect(groundData, 35, 35, 41, 41, 2);
fillRect(collisionData, 35, 35, 41, 41, 0);
fillRect(tallGrassData, 35, 35, 41, 41, 0);
// Shrine standing stones
setTile(collisionData, 36, 36, 5);
setTile(collisionData, 40, 36, 5);
setTile(collisionData, 36, 40, 5);
setTile(collisionData, 40, 40, 5);

// Pathway connecting Old Grove east to Dojo Plateau
fillRect(groundData, 42, 46, 58, 48, 2);
fillRect(collisionData, 42, 46, 58, 48, 0);
fillRect(tallGrassData, 42, 46, 58, 48, 0);

// 6. EMBER CRAGS & VOLCANO (North-East: x 46..78, y 2..26)
// Mountain switchback trails
for (let x = 46; x <= 74; x++) {
  setTile(groundData, x, 14, 2);
  setTile(groundData, x, 15, 2);
  if (x % 4 === 0) setTile(collisionData, x, 13, 5);
}
// Volcanic rocky crags
for (let x = 48; x <= 76; x++) {
  for (let y = 3; y <= 24; y++) {
    if (y !== 14 && y !== 15 && (x + y) % 4 === 0) {
      setTile(collisionData, x, y, 5); // Crag boulders
    } else if (y !== 14 && y !== 15) {
      setTile(tallGrassData, x, y, 3); // Volcanic ember grass
    }
  }
}

// Lava Caldera at x 62..68, y 6..10
fillRect(collisionData, 62, 6, 68, 10, 4); // Lava pool (collision)
fillRect(tallGrassData, 62, 6, 68, 10, 0);

// 7. CELESTIAL SUMMIT (Mountain Ridge: x 54..78, y 26..38)
// High alpine trail
for (let y = 26; y <= 38; y++) {
  const ridgeX = Math.round(64 + Math.sin(y * 0.3) * 4);
  setTile(groundData, ridgeX, y, 2);
  setTile(collisionData, ridgeX, y, 0);
  setTile(tallGrassData, ridgeX, y, 0);
}
// Alpine meadow patches
fillRect(tallGrassData, 56, 28, 62, 34, 3);
fillRect(tallGrassData, 68, 28, 74, 36, 3);

// 8. CHAMPION DOJO PLATEAU (Far East: x 58..78, y 38..58)
// Grand Pagoda Stairway ascending east
fillRect(groundData, 58, 45, 64, 47, 2);

// Dojo Courtyard & Arena (Ground 7: Tatami mats)
fillRect(groundData, 64, 42, 72, 50, 7);
fillRect(collisionData, 64, 42, 72, 50, 0);
fillRect(tallGrassData, 64, 42, 72, 50, 0);

// Grand Pagoda Gym backdrop walls at y 39..41
fillRect(collisionData, 64, 39, 72, 41, 5);

// Martial training dummies flanking the courtyard
setTile(collisionData, 63, 44, 5);
setTile(collisionData, 63, 48, 5);
setTile(collisionData, 73, 44, 5);
setTile(collisionData, 73, 48, 5);

const mapPayload = {
  width,
  height,
  tileSize: 16,
  spawn: { x: 10, y: 10 },
  healSpot: { x: 10, y: 8 },
  championSpot: { x: 68, y: 46 },
  layers: {
    ground: groundData,
    collision: collisionData,
    tallGrass: tallGrassData
  },
  zones: [
    { zoneId: 'pallet_plaza', x1: 4, y1: 4, x2: 18, y2: 16 },
    { zoneId: 'route1', x1: 19, y1: 3, x2: 45, y2: 19 },
    { zoneId: 'lakeshore', x1: 2, y1: 20, x2: 28, y2: 49 },
    { zoneId: 'sunken_grotto', x1: 2, y1: 50, x2: 22, y2: 58 },
    { zoneId: 'old_grove', x1: 25, y1: 20, x2: 53, y2: 58 },
    { zoneId: 'ember_crags', x1: 46, y1: 2, x2: 78, y2: 25 },
    { zoneId: 'celestial_summit', x1: 54, y1: 26, x2: 78, y2: 38 },
    { zoneId: 'dojo_plateau', x1: 56, y1: 39, x2: 78, y2: 58 }
  ]
};

const outPath = path.resolve(__dirname, '../apps/web/public/map.json');
fs.writeFileSync(outPath, JSON.stringify(mapPayload, null, 2), 'utf-8');
console.log(`Generated expanded map.json (${width}x${height}) at ${outPath}`);
