import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 40 x 30 tiles, 16px each
const width = 40;
const height = 30;

// Tile ID conventions:
// 0: empty
// 1: grass ground (walkable)
// 2: path / town pavement (walkable)
// 3: tall grass (wild encounter roll 10%)
// 4: water (collision)
// 5: tree / obstacle (collision)
// 6: heal pad in town (interactive)
// 7: dojo arena floor (walkable)

const groundData: number[] = new Array(width * height).fill(1); // default grass
const collisionData: number[] = new Array(width * height).fill(0);
const tallGrassData: number[] = new Array(width * height).fill(0);

// Helper to set tile
function setTile(arr: number[], x: number, y: number, val: number) {
  if (x >= 0 && x < width && y >= 0 && y < height) {
    arr[y * width + x] = val;
  }
}

// 1. Surrounding perimeter trees (collision)
for (let x = 0; x < width; x++) {
  setTile(collisionData, x, 0, 5);
  setTile(collisionData, x, height - 1, 5);
}
for (let y = 0; y < height; y++) {
  setTile(collisionData, 0, y, 5);
  setTile(collisionData, width - 1, y, 5);
}

// 2. Town Area (Top-Left: x 2..10, y 2..8)
for (let x = 2; x <= 10; x++) {
  for (let y = 2; y <= 8; y++) {
    setTile(groundData, x, y, 2); // path stone
  }
}
// Town heal spot at (5, 4)
setTile(groundData, 5, 4, 6);

// 3. Route 1 Path extending east (y=5, x=10..24)
for (let x = 11; x <= 24; x++) {
  setTile(groundData, x, 5, 2);
  setTile(groundData, x, 6, 2);
}

// Route 1 tall grass patches
for (let x = 12; x <= 20; x++) {
  setTile(tallGrassData, x, 3, 3);
  setTile(tallGrassData, x, 4, 3);
  setTile(tallGrassData, x, 7, 3);
  setTile(tallGrassData, x, 8, 3);
}

// 4. Lake Shore Area (South-West: x=3..12, y=14..26)
for (let x = 3; x <= 12; x++) {
  for (let y = 14; y <= 26; y++) {
    if (x >= 4 && x <= 10 && y >= 16 && y <= 24) {
      setTile(collisionData, x, y, 4); // water collision
    } else {
      setTile(tallGrassData, x, y, 3); // lakeside grass
    }
  }
}

// 5. Ember Crags (North-East: x=24..37, y=2..11)
for (let x = 24; x <= 37; x++) {
  for (let y = 2; y <= 11; y++) {
    if ((x + y) % 5 === 0) {
      setTile(collisionData, x, y, 5); // crags boulders
    } else {
      setTile(tallGrassData, x, y, 3); // crag grass
    }
  }
}

// 6. Old Grove (South-East: x=16..28, y=15..27)
for (let x = 16; x <= 28; x++) {
  for (let y = 15; y <= 27; y++) {
    if ((x * y) % 7 === 0) {
      setTile(collisionData, x, y, 5); // deep trees
    } else {
      setTile(tallGrassData, x, y, 3); // grove grass
    }
  }
}

// 7. Dojo Plateau (Far East: x=31..37, y=18..26)
for (let x = 31; x <= 37; x++) {
  for (let y = 18; y <= 26; y++) {
    setTile(groundData, x, y, 7); // dojo arena floor
  }
}

const mapPayload = {
  width,
  height,
  tileSize: 16,
  spawn: { x: 5, y: 5 },
  healSpot: { x: 5, y: 4 },
  championSpot: { x: 34, y: 22 },
  layers: {
    ground: groundData,
    collision: collisionData,
    tallGrass: tallGrassData
  },
  zones: [
    { zoneId: 'route1', x1: 11, y1: 2, x2: 23, y2: 10 },
    { zoneId: 'lakeshore', x1: 2, y1: 13, x2: 13, y2: 27 },
    { zoneId: 'ember_crags', x1: 24, y1: 1, x2: 38, y2: 12 },
    { zoneId: 'old_grove', x1: 15, y1: 14, x2: 29, y2: 28 },
    { zoneId: 'dojo_plateau', x1: 30, y1: 17, x2: 38, y2: 27 }
  ]
};

const outPath = path.resolve(__dirname, '../apps/web/public/map.json');
fs.writeFileSync(outPath, JSON.stringify(mapPayload, null, 2), 'utf-8');
console.log(`Generated map.json (${width}x${height}) at ${outPath}`);
