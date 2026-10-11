import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output directory for SVGs
const outputDir = path.resolve(__dirname, '../apps/web/public/sprites');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

interface Palette {
  primary: string;
  secondary: string;
  accent: string;
  eye: string;
}

const TYPE_PALETTES: Record<string, Palette> = {
  Fire: { primary: '#F26B38', secondary: '#FFB347', accent: '#D9381E', eye: '#FFF59D' },
  Water: { primary: '#3A86FF', secondary: '#8EC5FF', accent: '#1D4ED8', eye: '#E0F2FE' },
  Grass: { primary: '#3BB273', secondary: '#A7E07B', accent: '#15803D', eye: '#FEF08A' },
  Psy: { primary: '#C86BFA', secondary: '#F3B0FF', accent: '#7E22CE', eye: '#FAF5FF' },
  Dark: { primary: '#4A4458', secondary: '#7A6F9B', accent: '#1F1B24', eye: '#F43F5E' },
  Dragon: { primary: '#2A9D8F', secondary: '#F4D35E', accent: '#115E59', eye: '#FBBF24' },
  Fly: { primary: '#7FB7E6', secondary: '#E2E8F0', accent: '#3B82F6', eye: '#0F172A' },
  Fight: { primary: '#C0392B', secondary: '#F5B041', accent: '#7F1D1D', eye: '#FFFFFF' }
};

function renderMotif(type: string, stage: number, pal: Palette): string {
  const scale = stage === 1 ? 0.8 : stage === 2 ? 1.0 : 1.25;
  switch (type) {
    case 'Fire':
      return `<path d="M 32 8 Q 39 0 42 10 Q 47 2 50 18 Q 32 20 32 8 Z" fill="${pal.accent}" transform="scale(${scale}) translate(0, 4)" opacity="0.9" />`;
    case 'Water':
      return `<path d="M 32 6 C 29 13, 23 17, 23 23 C 23 30, 41 30, 41 23 C 41 17, 35 13, 32 6 Z" fill="${pal.secondary}" transform="scale(${scale * 0.75}) translate(11, 10)" opacity="0.85" />`;
    case 'Grass':
      return `<path d="M 32 12 Q 20 2 16 15 Q 25 17 32 12 Z M 32 12 Q 44 2 48 15 Q 39 17 32 12 Z" fill="${pal.accent}" transform="scale(${scale})" />`;
    case 'Psy':
      return `<circle cx="32" cy="16" r="${5 * scale}" fill="${pal.accent}" stroke="#FFF" stroke-width="1.5" /><circle cx="32" cy="16" r="${2.5 * scale}" fill="#FFF" />`;
    case 'Dark':
      return `<path d="M 27 6 A 7 7 0 0 0 37 16 A 5.5 5.5 0 0 1 27 6 Z" fill="${pal.secondary}" transform="scale(${scale * 1.2})" />`;
    case 'Dragon':
      return `<polygon points="18,12 24,2 29,12" fill="${pal.accent}" stroke="#111" stroke-width="1" /><polygon points="35,12 40,2 46,12" fill="${pal.accent}" stroke="#111" stroke-width="1" />`;
    case 'Fly':
      return `<path d="M 10 26 Q 0 16 8 10 Q 18 16 22 26 Z M 54 26 Q 64 16 56 10 Q 46 16 42 26 Z" fill="${pal.secondary}" stroke="${pal.accent}" stroke-width="1.5" />`;
    case 'Fight':
      return `<rect x="20" y="44" width="24" height="6" rx="3" fill="${pal.accent}" stroke="#111" stroke-width="1" /><rect x="22" y="42" width="20" height="2" fill="#FFF" />`;
    default:
      return '';
  }
}

function renderBody(shape: string, stage: number, pal: Palette): string {
  const r = stage === 1 ? 16 : stage === 2 ? 19 : 22;
  const cx = 32;
  const cy = stage === 1 ? 36 : stage === 2 ? 34 : 33;

  const belly = `<ellipse cx="${cx}" cy="${cy + 4}" rx="${r * 0.6}" ry="${r * 0.45}" fill="${pal.secondary}" opacity="0.6" />`;

  switch (shape) {
    case 'blob':
      return `
        <path d="M ${cx - r} ${cy} C ${cx - r} ${cy - r}, ${cx + r} ${cy - r}, ${cx + r} ${cy} C ${cx + r + 3} ${cy + r}, ${cx - r - 3} ${cy + r}, ${cx - r} ${cy} Z" fill="url(#grad)" stroke="#111" stroke-width="2.5" />
        ${belly}
      `;
    case 'orb':
      return `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#grad)" stroke="#111" stroke-width="2.5" />
        ${belly}
      `;
    case 'quadruped':
      return `
        <!-- Ears -->
        <polygon points="${cx - 11},${cy - r + 3} ${cx - 7},${cy - r - 7} ${cx - 2},${cy - r + 2}" fill="${pal.accent}" stroke="#111" stroke-width="1.5" />
        <polygon points="${cx + 2},${cy - r + 2} ${cx + 7},${cy - r - 7} ${cx + 11},${cy - r + 3}" fill="${pal.accent}" stroke="#111" stroke-width="1.5" />
        <!-- Body -->
        <ellipse cx="${cx}" cy="${cy + 2}" rx="${r * 1.1}" ry="${r * 0.85}" fill="url(#grad)" stroke="#111" stroke-width="2.5" />
        ${belly}
        <!-- Paws -->
        <ellipse cx="${cx - r + 3}" cy="${cy + r * 0.7}" rx="4.5" ry="3.5" fill="${pal.primary}" stroke="#111" stroke-width="1.8" />
        <ellipse cx="${cx + r - 3}" cy="${cy + r * 0.7}" rx="4.5" ry="3.5" fill="${pal.primary}" stroke="#111" stroke-width="1.8" />
      `;
    case 'bird':
      return `
        <!-- Wings -->
        <path d="M ${cx - r - 4} ${cy} Q ${cx - r - 8} ${cy - 12} ${cx - 10} ${cy - 4} Z" fill="${pal.secondary}" stroke="#111" stroke-width="1.5" />
        <path d="M ${cx + r + 4} ${cy} Q ${cx + r + 8} ${cy - 12} ${cx + 10} ${cy - 4} Z" fill="${pal.secondary}" stroke="#111" stroke-width="1.5" />
        <!-- Body -->
        <path d="M 20 42 Q 12 28 20 22 Q 32 16 44 22 Q 52 28 44 42 Z" fill="url(#grad)" stroke="#111" stroke-width="2.5" />
        ${belly}
        <!-- Beak -->
        <polygon points="${cx},${cy} ${cx + 4},${cy + 4} ${cx},${cy + 8} ${cx - 4},${cy + 4}" fill="#F59E0B" stroke="#111" stroke-width="1.5" />
      `;
    case 'fish':
      return `
        <!-- Fins -->
        <polygon points="${cx},${cy - r - 2} ${cx - 6},${cy - r + 4} ${cx + 6},${cy - r + 4}" fill="${pal.accent}" stroke="#111" stroke-width="1.5" />
        <polygon points="${cx - r - 2},${cy} ${cx - r - 10},${cy - 9} ${cx - r - 10},${cy + 9}" fill="${pal.secondary}" stroke="#111" stroke-width="2" />
        <!-- Body -->
        <ellipse cx="${cx}" cy="${cy}" rx="${r * 1.15}" ry="${r * 0.75}" fill="url(#grad)" stroke="#111" stroke-width="2.5" />
        ${belly}
      `;
    case 'serpent':
      return `
        <path d="M 16 46 C 12 30, 28 28, 32 18 C 34 12, 48 14, 46 22 C 44 32, 24 34, 48 46 Z" fill="url(#grad)" stroke="#111" stroke-width="2.5" />
        ${belly}
      `;
    case 'shell':
      return `
        <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.85}" fill="url(#grad)" stroke="#111" stroke-width="2.5" />
        <path d="M ${cx - r * 0.7} ${cy} Q ${cx} ${cy - r * 0.7} ${cx + r * 0.7} ${cy}" stroke="#111" stroke-width="2.5" fill="none" />
        <path d="M ${cx - r * 0.5} ${cy + 6} Q ${cx} ${cy - r * 0.2} ${cx + r * 0.5} ${cy + 6}" stroke="#111" stroke-width="1.5" fill="none" />
        <circle cx="${cx + r - 2}" cy="${cy + 2}" r="5" fill="${pal.secondary}" stroke="#111" stroke-width="2" />
      `;
    case 'biped':
    case 'winged':
    default:
      return `
        <!-- Horns/Crest -->
        <polygon points="${cx - 9},${cy - r} ${cx - 5},${cy - r - 6} ${cx - 1},${cy - r}" fill="${pal.accent}" stroke="#111" stroke-width="1.5" />
        <polygon points="${cx + 1},${cy - r} ${cx + 5},${cy - r - 6} ${cx + 9},${cy - r}" fill="${pal.accent}" stroke="#111" stroke-width="1.5" />
        <!-- Body -->
        <rect x="${cx - r * 0.85}" y="${cy - r * 0.9}" width="${r * 1.7}" height="${r * 1.8}" rx="${r * 0.6}" fill="url(#grad)" stroke="#111" stroke-width="2.5" />
        ${belly}
        <!-- Feet -->
        <ellipse cx="${cx - r * 0.45}" cy="${cy + r + 2}" rx="5" ry="3.5" fill="${pal.secondary}" stroke="#111" stroke-width="2" />
        <ellipse cx="${cx + r * 0.45}" cy="${cy + r + 2}" rx="5" ry="3.5" fill="${pal.secondary}" stroke="#111" stroke-width="2" />
      `;
  }
}

function renderFace(stage: number, pal: Palette): string {
  const eyeRadius = stage === 1 ? 3.8 : stage === 2 ? 3.2 : 2.8;
  const pupilRadius = stage === 1 ? 1.9 : 1.4;
  const cy = stage === 1 ? 34 : 32;

  // Mouth based on evolutionary stage
  const mouth = stage === 1
    ? `<path d="M 29 ${cy + 7} Q 32 ${cy + 9.5} 35 ${cy + 7}" stroke="#111" stroke-width="1.3" fill="none" stroke-linecap="round" />`
    : stage === 2
    ? `<path d="M 28 ${cy + 6} Q 32 ${cy + 8} 36 ${cy + 5}" stroke="#111" stroke-width="1.4" fill="none" stroke-linecap="round" />`
    : `<polygon points="28,${cy + 5} 32,${cy + 9} 36,${cy + 5}" fill="#FFF" stroke="#111" stroke-width="1.2" />`;

  return `
    <!-- Left Eye -->
    <ellipse cx="25.5" cy="${cy}" rx="${eyeRadius}" ry="${eyeRadius * 1.1}" fill="${pal.eye}" stroke="#111" stroke-width="1.4" />
    <circle cx="26.3" cy="${cy}" r="${pupilRadius}" fill="#111" />
    <circle cx="24.8" cy="${cy - 1.2}" r="1" fill="#FFF" />

    <!-- Right Eye -->
    <ellipse cx="38.5" cy="${cy}" rx="${eyeRadius}" ry="${eyeRadius * 1.1}" fill="${pal.eye}" stroke="#111" stroke-width="1.4" />
    <circle cx="39.3" cy="${cy}" r="${pupilRadius}" fill="#111" />
    <circle cx="37.8" cy="${cy - 1.2}" r="1" fill="#FFF" />

    <!-- Mouth -->
    ${mouth}
  `;
}

// Generate SVG string for a monster
export function generateMonsterSvg(name: string, type: string, shape: string, stage: 1 | 2 | 3): string {
  const pal = TYPE_PALETTES[type] || TYPE_PALETTES.Fire;

  // Stage 3 majestic radiant aura ring
  const aura = stage === 3 ? `
    <circle cx="32" cy="33" r="29" fill="none" stroke="${pal.secondary}" stroke-width="2" opacity="0.4" stroke-dasharray="4,3" />
    <circle cx="32" cy="33" r="26" fill="${pal.secondary}" opacity="0.18" />
  ` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <radialGradient id="grad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${pal.secondary}" />
      <stop offset="60%" stop-color="${pal.primary}" />
      <stop offset="100%" stop-color="${pal.accent}" />
    </radialGradient>
  </defs>
  <!-- Shadow Disc -->
  <ellipse cx="32" cy="58" rx="19" ry="4.5" fill="#000" opacity="0.25" />
  ${aura}
  <!-- Motif background -->
  ${renderMotif(type, stage, pal)}
  <!-- Body shape -->
  ${renderBody(shape, stage, pal)}
  <!-- Expressive Face & Eyes -->
  ${renderFace(stage, pal)}
</svg>`;
}

// Run if directly executed
import { SPECIES } from '../packages/shared/src/species.js';

for (const s of SPECIES) {
  const svg = generateMonsterSvg(s.name, s.type, s.bodyShape, s.stage);
  fs.writeFileSync(path.join(outputDir, `${s.id}.svg`), svg, 'utf-8');
}

console.log(`Successfully generated all ${SPECIES.length} enhanced monster SVGs in ${outputDir}`);
