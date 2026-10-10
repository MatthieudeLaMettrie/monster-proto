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
      return `<path d="M 32 10 Q 38 2 40 12 Q 44 4 48 18 Q 32 20 32 10 Z" fill="${pal.accent}" transform="scale(${scale}) translate(0, 4)" />`;
    case 'Water':
      return `<path d="M 32 8 C 30 14, 25 18, 25 24 C 25 30, 39 30, 39 24 C 39 18, 34 14, 32 8 Z" fill="${pal.secondary}" transform="scale(${scale * 0.7}) translate(16, 12)" />`;
    case 'Grass':
      return `<path d="M 32 14 Q 22 4 18 16 Q 26 18 32 14 Z M 32 14 Q 42 4 46 16 Q 38 18 32 14 Z" fill="${pal.secondary}" transform="scale(${scale})" />`;
    case 'Psy':
      return `<circle cx="32" cy="18" r="${4 * scale}" fill="${pal.accent}" stroke="#FFF" stroke-width="1.5" />`;
    case 'Dark':
      return `<path d="M 28 8 A 6 6 0 0 0 36 16 A 4.5 4.5 0 0 1 28 8 Z" fill="${pal.secondary}" transform="scale(${scale * 1.2})" />`;
    case 'Dragon':
      return `<polygon points="20,12 24,4 28,12" fill="${pal.accent}" /><polygon points="36,12 40,4 44,12" fill="${pal.accent}" />`;
    case 'Fly':
      return `<path d="M 12 28 Q 2 20 8 14 Q 18 20 22 28 Z M 52 28 Q 62 20 56 14 Q 46 20 42 28 Z" fill="${pal.secondary}" stroke="${pal.accent}" stroke-width="1" />`;
    case 'Fight':
      return `<rect x="22" y="44" width="20" height="5" rx="2" fill="${pal.accent}" /><rect x="24" y="42" width="16" height="2" fill="#FFF" />`;
    default:
      return '';
  }
}

function renderBody(shape: string, stage: number, pal: Palette): string {
  const r = stage === 1 ? 16 : stage === 2 ? 19 : 22;
  const cx = 32;
  const cy = stage === 1 ? 36 : stage === 2 ? 34 : 33;

  switch (shape) {
    case 'blob':
      return `<path d="M ${cx - r} ${cy} C ${cx - r} ${cy - r}, ${cx + r} ${cy - r}, ${cx + r} ${cy} C ${cx + r + 3} ${cy + r}, ${cx - r - 3} ${cy + r}, ${cx - r} ${cy} Z" fill="url(#grad)" stroke="#111" stroke-width="2.5" />`;
    case 'orb':
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#grad)" stroke="#111" stroke-width="2.5" />`;
    case 'quadruped':
      return `
        <ellipse cx="${cx}" cy="${cy + 2}" rx="${r * 1.1}" ry="${r * 0.85}" fill="url(#grad)" stroke="#111" stroke-width="2.5" />
        <circle cx="${cx - r + 3}" cy="${cy + r * 0.7}" r="4" fill="${pal.primary}" stroke="#111" stroke-width="2" />
        <circle cx="${cx + r - 3}" cy="${cy + r * 0.7}" r="4" fill="${pal.primary}" stroke="#111" stroke-width="2" />
      `;
    case 'bird':
      return `
        <path d="M 20 42 Q 12 30 20 24 Q 32 18 44 24 Q 52 30 44 42 Z" fill="url(#grad)" stroke="#111" stroke-width="2.5" />
        <polygon points="32,32 36,36 32,40 28,36" fill="#F59E0B" stroke="#111" stroke-width="1.5" />
      `;
    case 'fish':
      return `
        <ellipse cx="${cx}" cy="${cy}" rx="${r * 1.15}" ry="${r * 0.75}" fill="url(#grad)" stroke="#111" stroke-width="2.5" />
        <polygon points="${cx - r - 2},${cy} ${cx - r - 8},${cy - 8} ${cx - r - 8},${cy + 8}" fill="${pal.secondary}" stroke="#111" stroke-width="2" />
      `;
    case 'serpent':
      return `
        <path d="M 18 44 C 14 30, 30 28, 32 20 C 34 14, 46 16, 44 24 C 42 32, 26 36, 46 44 Z" fill="url(#grad)" stroke="#111" stroke-width="2.5" />
      `;
    case 'shell':
      return `
        <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.85}" fill="url(#grad)" stroke="#111" stroke-width="2.5" />
        <path d="M ${cx - r * 0.6} ${cy} Q ${cx} ${cy - r * 0.6} ${cx + r * 0.6} ${cy}" stroke="#111" stroke-width="2" fill="none" />
        <circle cx="${cx + r - 2}" cy="${cy + 2}" r="5" fill="${pal.secondary}" stroke="#111" stroke-width="2" />
      `;
    case 'biped':
    case 'winged':
    default:
      return `
        <rect x="${cx - r * 0.85}" y="${cy - r * 0.9}" width="${r * 1.7}" height="${r * 1.8}" rx="${r * 0.6}" fill="url(#grad)" stroke="#111" stroke-width="2.5" />
        <circle cx="${cx - r * 0.5}" cy="${cy + r + 2}" r="4" fill="${pal.secondary}" stroke="#111" stroke-width="2" />
        <circle cx="${cx + r * 0.5}" cy="${cy + r + 2}" r="4" fill="${pal.secondary}" stroke="#111" stroke-width="2" />
      `;
  }
}

function renderEyes(stage: number, pal: Palette): string {
  const eyeRadius = stage === 1 ? 3.5 : stage === 2 ? 3.0 : 2.5;
  const pupilRadius = stage === 1 ? 1.8 : 1.2;
  const cy = stage === 1 ? 34 : 32;

  return `
    <circle cx="26" cy="${cy}" r="${eyeRadius}" fill="${pal.eye}" stroke="#111" stroke-width="1.2" />
    <circle cx="26.8" cy="${cy}" r="${pupilRadius}" fill="#111" />
    <circle cx="38" cy="${cy}" r="${eyeRadius}" fill="${pal.eye}" stroke="#111" stroke-width="1.2" />
    <circle cx="38.8" cy="${cy}" r="${pupilRadius}" fill="#111" />
  `;
}

// Generate SVG string for a monster
export function generateMonsterSvg(name: string, type: string, shape: string, stage: 1 | 2 | 3): string {
  const pal = TYPE_PALETTES[type] || TYPE_PALETTES.Fire;
  const aura = stage === 3 ? `<circle cx="32" cy="34" r="28" fill="${pal.secondary}" opacity="0.25" filter="blur(3px)" />` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <radialGradient id="grad" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${pal.secondary}" />
      <stop offset="100%" stop-color="${pal.primary}" />
    </radialGradient>
  </defs>
  <!-- Shadow -->
  <ellipse cx="32" cy="58" rx="18" ry="4" fill="#000" opacity="0.2" />
  ${aura}
  <!-- Motif background -->
  ${renderMotif(type, stage, pal)}
  <!-- Body shape -->
  ${renderBody(shape, stage, pal)}
  <!-- Eyes -->
  ${renderEyes(stage, pal)}
</svg>`;
}

// Run if directly executed
import { SPECIES } from '../packages/shared/src/species.js';

for (const s of SPECIES) {
  const svg = generateMonsterSvg(s.name, s.type, s.bodyShape, s.stage);
  fs.writeFileSync(path.join(outputDir, `${s.id}.svg`), svg, 'utf-8');
}

console.log(`Generated all ${SPECIES.length} monster SVGs in ${outputDir}`);
