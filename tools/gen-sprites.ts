import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPECIES } from '../packages/shared/src/species.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.resolve(__dirname, '../apps/web/public/sprites');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

interface Palette {
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
  shadow: string;
  eye: string;
  glow: string;
}

const TYPE_PALETTES: Record<string, Palette> = {
  Fire: {
    primary: '#F97316',
    secondary: '#FBBF24',
    accent: '#DC2626',
    highlight: '#FEF08A',
    shadow: '#7F1D1D',
    eye: '#FEF08A',
    glow: '#F97316'
  },
  Water: {
    primary: '#0284C7',
    secondary: '#38BDF8',
    accent: '#1E40AF',
    highlight: '#BAE6FD',
    shadow: '#0C4A6E',
    eye: '#E0F2FE',
    glow: '#06B6D4'
  },
  Grass: {
    primary: '#16A34A',
    secondary: '#4ADE80',
    accent: '#14532D',
    highlight: '#BBF7D0',
    shadow: '#052E16',
    eye: '#FEF08A',
    glow: '#22C55E'
  },
  Psy: {
    primary: '#A855F7',
    secondary: '#C084FC',
    accent: '#6B21A8',
    highlight: '#F3E8FF',
    shadow: '#3B0764',
    eye: '#FAF5FF',
    glow: '#D946EF'
  },
  Dark: {
    primary: '#475569',
    secondary: '#64748B',
    accent: '#1E293B',
    highlight: '#94A3B8',
    shadow: '#0F172A',
    eye: '#F43F5E',
    glow: '#E11D48'
  },
  Dragon: {
    primary: '#0D9488',
    secondary: '#2DD4BF',
    accent: '#115E59',
    highlight: '#99F6E4',
    shadow: '#042F2E',
    eye: '#FBBF24',
    glow: '#14B8A6'
  },
  Fly: {
    primary: '#0EA5E9',
    secondary: '#7DD3FC',
    accent: '#0369A1',
    highlight: '#E0F2FE',
    shadow: '#075985',
    eye: '#0F172A',
    glow: '#38BDF8'
  },
  Fight: {
    primary: '#D97706',
    secondary: '#FBBF24',
    accent: '#9A3412',
    highlight: '#FEF3C7',
    shadow: '#7C2D12',
    eye: '#FFFFFF',
    glow: '#EA580C'
  }
};

function renderAura(type: string, stage: 1 | 2 | 3, pal: Palette): string {
  if (stage === 1) return '';
  if (stage === 2) {
    return `<circle cx="32" cy="32" r="28" fill="${pal.glow}" opacity="0.1" />
            <circle cx="32" cy="32" r="27" fill="none" stroke="${pal.glow}" stroke-width="1.2" opacity="0.3" stroke-dasharray="3,3" />`;
  }
  // Stage 3 majestic celestial aura
  return `
    <defs>
      <radialGradient id="auraGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${pal.glow}" stop-opacity="0.35" />
        <stop offset="70%" stop-color="${pal.secondary}" stop-opacity="0.15" />
        <stop offset="100%" stop-color="${pal.accent}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="31" fill="url(#auraGrad)" />
    <circle cx="32" cy="32" r="30" fill="none" stroke="${pal.secondary}" stroke-width="1.8" opacity="0.5" stroke-dasharray="4,4" />
    <circle cx="32" cy="32" r="28" fill="none" stroke="${pal.highlight}" stroke-width="0.8" opacity="0.7" />
    <polygon points="32,1 34,4 32,7 30,4" fill="${pal.highlight}" opacity="0.8" />
    <polygon points="63,32 60,34 57,32 60,30" fill="${pal.highlight}" opacity="0.8" />
    <polygon points="32,63 34,60 32,57 30,60" fill="${pal.highlight}" opacity="0.8" />
    <polygon points="1,32 4,34 7,32 4,30" fill="${pal.highlight}" opacity="0.8" />
  `;
}

function renderEyes(cx: number, cy: number, spacing: number, stage: 1 | 2 | 3, pal: Palette, isSlit = false): string {
  const eyeR = stage === 1 ? 4.2 : stage === 2 ? 3.4 : 2.9;
  const pupilR = stage === 1 ? 2.1 : stage === 2 ? 1.6 : 1.3;
  const lx = cx - spacing;
  const rx = cx + spacing;

  const leftEye = isSlit
    ? `<ellipse cx="${lx}" cy="${cy}" rx="${eyeR * 0.9}" ry="${eyeR * 1.3}" fill="${pal.eye}" stroke="#0F172A" stroke-width="1.2" />
       <line x1="${lx}" y1="${cy - eyeR}" x2="${lx}" y2="${cy + eyeR}" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />`
    : `<ellipse cx="${lx}" cy="${cy}" rx="${eyeR}" ry="${eyeR * 1.15}" fill="${pal.eye}" stroke="#0F172A" stroke-width="1.2" />
       <circle cx="${lx + 0.6}" cy="${cy}" r="${pupilR}" fill="#0F172A" />
       <circle cx="${lx - 0.9}" cy="${cy - 1.1}" r="1.1" fill="#FFFFFF" />`;

  const rightEye = isSlit
    ? `<ellipse cx="${rx}" cy="${cy}" rx="${eyeR * 0.9}" ry="${eyeR * 1.3}" fill="${pal.eye}" stroke="#0F172A" stroke-width="1.2" />
       <line x1="${rx}" y1="${cy - eyeR}" x2="${rx}" y2="${cy + eyeR}" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />`
    : `<ellipse cx="${rx}" cy="${cy}" rx="${eyeR}" ry="${eyeR * 1.15}" fill="${pal.eye}" stroke="#0F172A" stroke-width="1.2" />
       <circle cx="${rx + 0.6}" cy="${cy}" r="${pupilR}" fill="#0F172A" />
       <circle cx="${rx - 0.9}" cy="${cy - 1.1}" r="1.1" fill="#FFFFFF" />`;

  const brow = stage === 3
    ? `<path d="M ${lx - eyeR} ${cy - eyeR - 1.5} Q ${lx} ${cy - eyeR} ${lx + eyeR} ${cy - eyeR + 0.5}" stroke="#0F172A" stroke-width="1.6" fill="none" stroke-linecap="round" />
       <path d="M ${rx - eyeR} ${cy - eyeR + 0.5} Q ${rx} ${cy - eyeR} ${rx + eyeR} ${cy - eyeR - 1.5}" stroke="#0F172A" stroke-width="1.6" fill="none" stroke-linecap="round" />`
    : '';

  return `<!-- Expressive Eyes -->
    ${brow}
    ${leftEye}
    ${rightEye}
  `;
}

function renderMouth(cx: number, cy: number, stage: 1 | 2 | 3, fierce = false): string {
  if (fierce || stage === 3) {
    return `<path d="M ${cx - 5} ${cy} Q ${cx} ${cy + 4} ${cx + 5} ${cy}" stroke="#0F172A" stroke-width="1.5" fill="none" stroke-linecap="round" />
            <polygon points="${cx - 3},${cy} ${cx - 2},${cy + 2.5} ${cx - 1},${cy}" fill="#FFFFFF" stroke="#0F172A" stroke-width="0.8" />
            <polygon points="${cx + 1},${cy} ${cx + 2},${cy + 2.5} ${cx + 3},${cy}" fill="#FFFFFF" stroke="#0F172A" stroke-width="0.8" />`;
  }
  if (stage === 2) {
    return `<path d="M ${cx - 4} ${cy} Q ${cx} ${cy + 3} ${cx + 4} ${cy}" stroke="#0F172A" stroke-width="1.4" fill="none" stroke-linecap="round" />`;
  }
  // Stage 1 cute curve
  return `<path d="M ${cx - 3.5} ${cy} Q ${cx} ${cy + 3.2} ${cx + 3.5} ${cy}" stroke="#0F172A" stroke-width="1.3" fill="none" stroke-linecap="round" />`;
}

export function generateMonsterSvg(lineId: number, stage: 1 | 2 | 3, name: string, type: string): string {
  const pal = TYPE_PALETTES[type] || TYPE_PALETTES.Fire;

  // Shadow disc at feet
  const shadow = `<ellipse cx="32" cy="58" rx="${stage === 1 ? 16 : stage === 2 ? 20 : 24}" ry="4" fill="#000000" opacity="0.25" />`;
  const aura = renderAura(type, stage, pal);

  let art = '';

  switch (lineId) {
    // --- Line 1: Fire Hound (Emberpup -> Cindhound -> Infernmastiff) ---
    case 1: {
      const mane = stage === 1
        ? `<circle cx="32" cy="22" r="3" fill="${pal.secondary}" />`
        : stage === 2
        ? `<path d="M 20 28 Q 14 18 24 20 Q 32 12 40 20 Q 50 18 44 28 Z" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.5" />`
        : `<path d="M 12 30 Q 6 12 22 16 Q 32 4 42 16 Q 58 12 52 30 Q 58 42 48 40 Q 32 46 16 40 Z" fill="${pal.accent}" stroke="#0F172A" stroke-width="2" />
           <path d="M 16 28 Q 12 16 24 20 Q 32 10 40 20 Q 48 16 48 28 Z" fill="${pal.secondary}" />`;

      const tail = stage === 1
        ? `<path d="M 44 44 Q 56 36 52 24 Q 46 32 42 40 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.4" />`
        : stage === 2
        ? `<path d="M 46 42 Q 62 30 54 16 Q 46 26 44 38 Z" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.8" />
           <path d="M 47 38 Q 58 28 52 18 Q 48 26 45 36 Z" fill="${pal.secondary}" />`
        : `<path d="M 48 42 Q 66 26 56 8 Q 44 24 44 38 Z" fill="${pal.accent}" stroke="#0F172A" stroke-width="2" />
           <path d="M 50 36 Q 64 22 56 12 Q 48 22 47 34 Z" fill="${pal.secondary}" />
           <path d="M 51 32 Q 60 20 54 14 Q 50 20 48 30 Z" fill="${pal.highlight}" />`;

      const bodyR = stage === 1 ? 14 : stage === 2 ? 17 : 20;
      const ears = stage === 1
        ? `<polygon points="21,24 17,14 26,20" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.4" />
           <polygon points="43,24 47,14 38,20" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.4" />`
        : stage === 2
        ? `<polygon points="20,22 14,8 27,18" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.6" />
           <polygon points="44,22 50,8 37,18" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.6" />`
        : `<polygon points="18,20 10,4 27,16" fill="${pal.accent}" stroke="#0F172A" stroke-width="2" />
           <polygon points="46,20 54,4 37,16" fill="${pal.accent}" stroke="#0F172A" stroke-width="2" />`;

      art = `
        ${mane}
        ${tail}
        ${ears}
        <!-- Body -->
        <ellipse cx="32" cy="40" rx="${bodyR}" ry="${bodyR * 0.85}" fill="url(#grad)" stroke="#0F172A" stroke-width="2.2" />
        <!-- Belly -->
        <ellipse cx="32" cy="42" rx="${bodyR * 0.55}" ry="${bodyR * 0.45}" fill="${pal.secondary}" opacity="0.75" />
        <!-- Paws -->
        <ellipse cx="${32 - bodyR * 0.55}" cy="${40 + bodyR * 0.6}" rx="5" ry="4" fill="${pal.primary}" stroke="#0F172A" stroke-width="1.6" />
        <ellipse cx="${32 + bodyR * 0.55}" cy="${40 + bodyR * 0.6}" rx="5" ry="4" fill="${pal.primary}" stroke="#0F172A" stroke-width="1.6" />
        ${renderEyes(32, 34, stage === 1 ? 6.5 : 7.5, stage, pal)}
        <!-- Snout -->
        <ellipse cx="32" cy="38" rx="3.5" ry="2.2" fill="${pal.shadow}" />
        ${renderMouth(32, 41, stage, stage === 3)}
      `;
      break;
    }

    // --- Line 2: Fire Lynx (Flickit -> Blazelynx -> Pyrolynx) ---
    case 2: {
      const earTufts = stage === 1
        ? `<polygon points="18,22 15,10 24,19" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.4" />
           <polygon points="46,22 49,10 40,19" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.4" />`
        : `<polygon points="17,20 12,4 25,17" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.6" />
           <polygon points="14,10 10,2 18,12" fill="${pal.secondary}" />
           <polygon points="47,20 52,4 39,17" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.6" />
           <polygon points="50,10 54,2 46,12" fill="${pal.secondary}" />`;

      const tail = `<path d="M 45 42 Q 58 34 54 22 Q 48 30 43 38 Z" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.6" />`;
      const bodyR = stage === 1 ? 13 : stage === 2 ? 16 : 19;

      art = `
        ${tail}
        ${earTufts}
        <ellipse cx="32" cy="39" rx="${bodyR}" ry="${bodyR * 0.8}" fill="url(#grad)" stroke="#0F172A" stroke-width="2.2" />
        <ellipse cx="32" cy="41" rx="${bodyR * 0.5}" ry="${bodyR * 0.4}" fill="${pal.secondary}" opacity="0.8" />
        <!-- Feline Whiskers -->
        <path d="M 21 39 L 14 38 M 21 41 L 13 42" stroke="${pal.secondary}" stroke-width="1.2" stroke-linecap="round" />
        <path d="M 43 39 L 50 38 M 43 41 L 51 42" stroke="${pal.secondary}" stroke-width="1.2" stroke-linecap="round" />
        <!-- Paws -->
        <ellipse cx="${32 - bodyR * 0.5}" cy="${39 + bodyR * 0.6}" rx="4.5" ry="3.5" fill="${pal.primary}" stroke="#0F172A" stroke-width="1.5" />
        <ellipse cx="${32 + bodyR * 0.5}" cy="${39 + bodyR * 0.6}" rx="4.5" ry="3.5" fill="${pal.primary}" stroke="#0F172A" stroke-width="1.5" />
        ${renderEyes(32, 33, stage === 1 ? 6 : 7, stage, pal, true)}
        <!-- Cat nose -->
        <polygon points="32,36 30.5,35 33.5,35" fill="${pal.shadow}" />
        ${renderMouth(32, 38.5, stage, stage === 3)}
      `;
      break;
    }

    // --- Line 3: Fire Beetle (Coalbug -> Magmite -> Volcarapace) ---
    case 3: {
      const horn = stage === 1
        ? `<polygon points="32,18 30,10 34,10" fill="${pal.shadow}" stroke="#0F172A" stroke-width="1.4" />`
        : stage === 2
        ? `<path d="M 30 20 L 26 6 L 30 10 L 32 4 L 34 10 L 38 6 L 34 20 Z" fill="${pal.shadow}" stroke="#0F172A" stroke-width="1.6" />`
        : `<path d="M 28 22 L 20 4 L 26 10 L 32 2 L 38 10 L 44 4 L 36 22 Z" fill="${pal.shadow}" stroke="#0F172A" stroke-width="2" />
           <polygon points="32,6 34,11 30,11" fill="${pal.secondary}" />`;

      const vents = stage === 3
        ? `<ellipse cx="20" cy="30" rx="4" ry="2.5" fill="${pal.shadow}" stroke="#0F172A" stroke-width="1.5" />
           <circle cx="20" cy="30" r="1.8" fill="${pal.secondary}" />
           <ellipse cx="44" cy="30" rx="4" ry="2.5" fill="${pal.shadow}" stroke="#0F172A" stroke-width="1.5" />
           <circle cx="44" cy="30" r="1.8" fill="${pal.secondary}" />`
        : '';

      const r = stage === 1 ? 14 : stage === 2 ? 17 : 21;
      art = `
        ${horn}
        <!-- Carapace Back Shell -->
        <ellipse cx="32" cy="40" rx="${r * 1.1}" ry="${r * 0.9}" fill="${pal.shadow}" stroke="#0F172A" stroke-width="2.5" />
        <!-- Molten Fissures -->
        <path d="M 32 24 L 32 54" stroke="${pal.secondary}" stroke-width="${stage === 3 ? 3 : 2}" stroke-linecap="round" />
        <path d="M 32 36 Q 22 34 18 42" stroke="${pal.secondary}" stroke-width="2" stroke-linecap="round" />
        <path d="M 32 36 Q 42 34 46 42" stroke="${pal.secondary}" stroke-width="2" stroke-linecap="round" />
        ${vents}
        <!-- Beetle Legs -->
        <line x1="16" y1="42" x2="8" y2="48" stroke="#0F172A" stroke-width="2" stroke-linecap="round" />
        <line x1="16" y1="48" x2="10" y2="54" stroke="#0F172A" stroke-width="2" stroke-linecap="round" />
        <line x1="48" y1="42" x2="56" y2="48" stroke="#0F172A" stroke-width="2" stroke-linecap="round" />
        <line x1="48" y1="48" x2="54" y2="54" stroke="#0F172A" stroke-width="2" stroke-linecap="round" />
        ${renderEyes(32, 28, stage === 1 ? 5.5 : 6.5, stage, pal)}
      `;
      break;
    }

    // --- Line 4: Water Fin (Puddlefin -> Tidefin -> Abyssfin) ---
    case 4: {
      const dorsalFin = stage === 1
        ? `<path d="M 32 20 Q 24 6 36 12 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.4" opacity="0.85" />`
        : stage === 2
        ? `<path d="M 32 18 Q 20 2 38 8 Q 42 16 34 18 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.6" opacity="0.85" />`
        : `<path d="M 32 16 Q 14 0 42 6 Q 48 16 34 18 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="2" opacity="0.9" />
           <polygon points="32,4 35,9 29,9" fill="${pal.highlight}" />`;

      const flukes = stage === 1
        ? `<path d="M 44 40 Q 56 34 54 48 Q 46 44 42 42 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.4" />`
        : stage === 2
        ? `<path d="M 46 38 Q 62 30 58 50 Q 48 44 44 40 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.8" />`
        : `<path d="M 48 36 Q 66 24 62 52 Q 50 44 44 40 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="2.2" />
           <circle cx="56" cy="38" r="2" fill="${pal.highlight}" />`;

      const bodyR = stage === 1 ? 14 : stage === 2 ? 17 : 20;

      art = `
        ${dorsalFin}
        ${flukes}
        <ellipse cx="32" cy="38" rx="${bodyR * 1.1}" ry="${bodyR * 0.8}" fill="url(#grad)" stroke="#0F172A" stroke-width="2.2" />
        <ellipse cx="32" cy="41" rx="${bodyR * 0.6}" ry="${bodyR * 0.4}" fill="${pal.highlight}" opacity="0.75" />
        <!-- Pectoral Fin -->
        <path d="M 28 42 Q 18 48 24 52 Q 30 48 30 42 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.5" />
        ${renderEyes(32, 33, stage === 1 ? 6.5 : 7.5, stage, pal)}
        ${renderMouth(32, 39, stage)}
      `;
      break;
    }

    // --- Line 5: Water Toad (Bubblot -> Brinetoad -> Torrentoad) ---
    case 5: {
      const shoulderBubbles = stage === 1
        ? `<circle cx="20" cy="30" r="4" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.2" opacity="0.8" />
           <circle cx="44" cy="30" r="4" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.2" opacity="0.8" />`
        : stage === 2
        ? `<circle cx="16" cy="28" r="6" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.5" opacity="0.85" />
           <circle cx="48" cy="28" r="6" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.5" opacity="0.85" />`
        : `<circle cx="14" cy="26" r="8" fill="${pal.secondary}" stroke="#0F172A" stroke-width="2" opacity="0.9" />
           <circle cx="13" cy="24" r="2.5" fill="#FFFFFF" />
           <circle cx="50" cy="26" r="8" fill="${pal.secondary}" stroke="#0F172A" stroke-width="2" opacity="0.9" />
           <circle cx="49" cy="24" r="2.5" fill="#FFFFFF" />`;

      const r = stage === 1 ? 16 : stage === 2 ? 19 : 23;
      art = `
        ${shoulderBubbles}
        <ellipse cx="32" cy="40" rx="${r}" ry="${r * 0.75}" fill="url(#grad)" stroke="#0F172A" stroke-width="2.4" />
        <!-- Big Round Belly -->
        <ellipse cx="32" cy="42" rx="${r * 0.6}" ry="${r * 0.45}" fill="${pal.highlight}" opacity="0.8" />
        <!-- Webbed Feet -->
        <ellipse cx="${32 - r * 0.6}" cy="${40 + r * 0.6}" rx="5.5" ry="3.5" fill="${pal.primary}" stroke="#0F172A" stroke-width="1.6" />
        <ellipse cx="${32 + r * 0.6}" cy="${40 + r * 0.6}" rx="5.5" ry="3.5" fill="${pal.primary}" stroke="#0F172A" stroke-width="1.6" />
        <!-- Big Toad Eyes perched on head -->
        <circle cx="24" cy="28" r="5" fill="url(#grad)" stroke="#0F172A" stroke-width="2" />
        <circle cx="40" cy="28" r="5" fill="url(#grad)" stroke="#0F172A" stroke-width="2" />
        ${renderEyes(32, 28, 8, stage, pal)}
        <!-- Wide Smile -->
        <path d="M 23 38 Q 32 44 41 38" stroke="#0F172A" stroke-width="${stage === 3 ? 2 : 1.5}" fill="none" stroke-linecap="round" />
      `;
      break;
    }

    // --- Line 6: Water Turtle/Coral (Shellby -> Coralisk -> Leviashell) ---
    case 6: {
      const coralCrown = stage === 1
        ? ''
        : stage === 2
        ? `<path d="M 26 22 L 24 12 M 24 15 L 20 10 M 38 22 L 40 12 M 40 15 L 44 10" stroke="#F43F5E" stroke-width="2" stroke-linecap="round" />`
        : `<path d="M 24 22 L 20 8 M 20 13 L 14 8 M 22 10 L 26 4 M 40 22 L 44 8 M 44 13 L 50 8 M 42 10 L 38 4" stroke="#F43F5E" stroke-width="2.5" stroke-linecap="round" />
           <circle cx="20" cy="7" r="2" fill="${pal.highlight}" />
           <circle cx="44" cy="7" r="2" fill="${pal.highlight}" />`;

      const r = stage === 1 ? 15 : stage === 2 ? 18 : 22;
      art = `
        ${coralCrown}
        <!-- Turtle Flippers -->
        <ellipse cx="14" cy="34" rx="7" ry="4" fill="${pal.primary}" stroke="#0F172A" stroke-width="1.6" transform="rotate(-20 14 34)" />
        <ellipse cx="50" cy="34" rx="7" ry="4" fill="${pal.primary}" stroke="#0F172A" stroke-width="1.6" transform="rotate(20 50 34)" />
        <!-- Head -->
        <ellipse cx="32" cy="27" rx="8" ry="7" fill="url(#grad)" stroke="#0F172A" stroke-width="2" />
        <!-- Domed Shell -->
        <ellipse cx="32" cy="42" rx="${r}" ry="${r * 0.75}" fill="${pal.shadow}" stroke="#0F172A" stroke-width="2.4" />
        <!-- Shell Hex Pattern -->
        <polygon points="32,34 37,37 37,43 32,46 27,43 27,37" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.4" />
        ${renderEyes(32, 26, 4.5, stage, pal)}
        ${renderMouth(32, 29.5, stage)}
      `;
      break;
    }

    // --- Line 7: Grass Dinosaur (Sproutle -> Bramblet -> Florasaur) ---
    case 7: {
      const plant = stage === 1
        ? `<!-- Sprout on head -->
           <path d="M 32 20 Q 24 10 20 18 Q 28 18 32 20 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.2" />
           <path d="M 32 20 Q 40 10 44 18 Q 36 18 32 20 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.2" />`
        : stage === 2
        ? `<!-- Spiky Foliage Collar -->
           <polygon points="18,24 12,14 24,20" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.4" />
           <polygon points="46,24 52,14 40,20" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.4" />
           <polygon points="32,18 30,8 34,8" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.4" />`
        : `<!-- Giant Majestic Tropical Flower Bloom on Back -->
           <circle cx="32" cy="20" r="16" fill="#F43F5E" stroke="#0F172A" stroke-width="2" />
           <circle cx="32" cy="20" r="12" fill="#FB7185" />
           <circle cx="32" cy="20" r="6" fill="#FBBF24" stroke="#0F172A" stroke-width="1.5" />
           <!-- Vine Whips -->
           <path d="M 18 32 Q 4 20 8 38" stroke="${pal.accent}" stroke-width="2.5" fill="none" stroke-linecap="round" />
           <path d="M 46 32 Q 60 20 56 38" stroke="${pal.accent}" stroke-width="2.5" fill="none" stroke-linecap="round" />`;

      const r = stage === 1 ? 14 : stage === 2 ? 17 : 21;
      art = `
        ${plant}
        <!-- Dino Body -->
        <ellipse cx="32" cy="40" rx="${r}" ry="${r * 0.8}" fill="url(#grad)" stroke="#0F172A" stroke-width="2.2" />
        <ellipse cx="32" cy="42" rx="${r * 0.55}" ry="${r * 0.45}" fill="${pal.highlight}" opacity="0.8" />
        <!-- Sturdy Legs -->
        <rect x="${32 - r * 0.6}" y="${40 + r * 0.3}" width="6" height="8" rx="3" fill="${pal.primary}" stroke="#0F172A" stroke-width="1.6" />
        <rect x="${32 + r * 0.3}" y="${40 + r * 0.3}" width="6" height="8" rx="3" fill="${pal.primary}" stroke="#0F172A" stroke-width="1.6" />
        ${renderEyes(32, 33, stage === 1 ? 6 : 7.5, stage, pal)}
        ${renderMouth(32, 38.5, stage, stage === 3)}
      `;
      break;
    }

    // --- Line 8: Grass Raptor (Seedling -> Leafrunner -> Galevine) ---
    case 8: {
      const leafCrest = stage === 1
        ? `<path d="M 32 18 Q 20 4 22 18 Q 30 14 32 18 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.2" />`
        : stage === 2
        ? `<path d="M 32 16 Q 16 -2 20 16 Q 28 12 32 16 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.5" />
           <path d="M 34 16 Q 48 0 44 16 Q 38 12 34 16 Z" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.5" />`
        : `<path d="M 32 14 Q 10 -6 18 16 Q 28 10 32 14 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="2" />
           <path d="M 35 14 Q 54 -4 46 16 Q 38 10 35 14 Z" fill="${pal.accent}" stroke="#0F172A" stroke-width="2" />
           <polygon points="32,2 35,8 29,8" fill="${pal.highlight}" />`;

      const bladeWings = stage === 1
        ? ''
        : `<path d="M 20 36 Q 4 30 12 44 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.6" />
           <path d="M 44 36 Q 60 30 52 44 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.6" />`;

      const r = stage === 1 ? 13 : stage === 2 ? 16 : 19;
      art = `
        ${leafCrest}
        ${bladeWings}
        <ellipse cx="32" cy="38" rx="${r}" ry="${r * 0.85}" fill="url(#grad)" stroke="#0F172A" stroke-width="2.2" />
        <ellipse cx="32" cy="40" rx="${r * 0.5}" ry="${r * 0.4}" fill="${pal.highlight}" opacity="0.8" />
        <!-- Raptor Claws -->
        <polygon points="${32 - r * 0.4},54 ${32 - r * 0.4 - 3},58 ${32 - r * 0.4 + 3},58" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.2" />
        <polygon points="${32 + r * 0.4},54 ${32 + r * 0.4 - 3},58 ${32 + r * 0.4 + 3},58" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.2" />
        ${renderEyes(32, 32, stage === 1 ? 5.5 : 7, stage, pal)}
        ${renderMouth(32, 37.5, stage, stage === 3)}
      `;
      break;
    }

    // --- Line 9: Grass Treant (Mosskin -> Briarheart -> Ironbark) ---
    case 9: {
      const branches = stage === 1
        ? `<circle cx="32" cy="18" r="4" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.2" />`
        : stage === 2
        ? `<path d="M 22 20 L 16 8 M 16 12 L 12 10 M 42 20 L 48 8 M 48 12 L 52 10" stroke="#78350F" stroke-width="2.2" stroke-linecap="round" />`
        : `<path d="M 20 20 L 12 4 M 12 10 L 6 6 M 14 6 L 18 2 M 44 20 L 52 4 M 52 10 L 58 6 M 50 6 L 46 2" stroke="#78350F" stroke-width="3" stroke-linecap="round" />
           <circle cx="12" cy="4" r="3" fill="${pal.secondary}" />
           <circle cx="52" cy="4" r="3" fill="${pal.secondary}" />`;

      const rune = stage >= 2
        ? `<circle cx="32" cy="40" r="${stage === 3 ? 5 : 3.5}" fill="${pal.highlight}" stroke="${pal.secondary}" stroke-width="1.5" />`
        : '';

      const r = stage === 1 ? 15 : stage === 2 ? 18 : 22;
      art = `
        ${branches}
        <ellipse cx="32" cy="38" rx="${r}" ry="${r * 0.9}" fill="url(#grad)" stroke="#0F172A" stroke-width="2.5" />
        ${rune}
        <!-- Root Feet -->
        <ellipse cx="${32 - r * 0.5}" cy="${38 + r * 0.7}" rx="5" ry="3.5" fill="#78350F" stroke="#0F172A" stroke-width="1.6" />
        <ellipse cx="${32 + r * 0.5}" cy="${38 + r * 0.7}" rx="5" ry="3.5" fill="#78350F" stroke="#0F172A" stroke-width="1.6" />
        ${renderEyes(32, 31, stage === 1 ? 6 : 7.5, stage, pal)}
        ${renderMouth(32, 36, stage)}
      `;
      break;
    }

    // --- Line 10: Psychic Cosmic Hound (Psypup -> Mindhound -> Cerebrox) ---
    case 10: {
      const psychicGem = `<polygon points="32,20 35,24 32,28 29,24" fill="${pal.highlight}" stroke="#FFFFFF" stroke-width="1.4" />
                          <circle cx="32" cy="24" r="1.5" fill="#FFFFFF" />`;

      const halo = stage === 3
        ? `<ellipse cx="32" cy="24" rx="18" ry="6" fill="none" stroke="${pal.secondary}" stroke-width="1.8" stroke-dasharray="4,2" />`
        : stage === 2
        ? `<ellipse cx="32" cy="24" rx="14" ry="4" fill="none" stroke="${pal.secondary}" stroke-width="1.4" opacity="0.8" />`
        : '';

      const r = stage === 1 ? 14 : stage === 2 ? 17 : 20;
      art = `
        ${halo}
        <ellipse cx="32" cy="40" rx="${r}" ry="${r * 0.85}" fill="url(#grad)" stroke="#0F172A" stroke-width="2.2" />
        <ellipse cx="32" cy="42" rx="${r * 0.5}" ry="${r * 0.4}" fill="${pal.highlight}" opacity="0.75" />
        ${psychicGem}
        <!-- Paws -->
        <ellipse cx="${32 - r * 0.5}" cy="${40 + r * 0.6}" rx="4.5" ry="3.5" fill="${pal.primary}" stroke="#0F172A" stroke-width="1.5" />
        <ellipse cx="${32 + r * 0.5}" cy="${40 + r * 0.6}" rx="4.5" ry="3.5" fill="${pal.primary}" stroke="#0F172A" stroke-width="1.5" />
        ${renderEyes(32, 34, 6.5, stage, pal)}
        ${renderMouth(32, 39.5, stage)}
      `;
      break;
    }

    // --- Line 11: Psychic Prism Moth (Gleamling -> Prismoth -> Aethermoth) ---
    case 11: {
      const wingSpan = stage === 1 ? 14 : stage === 2 ? 20 : 26;
      const wings = `
        <!-- Left Wing -->
        <path d="M 30 32 Q ${32 - wingSpan} 10 ${32 - wingSpan + 4} 34 Q ${32 - wingSpan} 50 30 40 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.8" opacity="0.85" />
        <!-- Right Wing -->
        <path d="M 34 32 Q ${32 + wingSpan} 10 ${32 + wingSpan - 4} 34 Q ${32 + wingSpan} 50 34 40 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.8" opacity="0.85" />
        <!-- Prism Facets -->
        <circle cx="${32 - wingSpan * 0.55}" cy="28" r="3" fill="${pal.highlight}" opacity="0.9" />
        <circle cx="${32 + wingSpan * 0.55}" cy="28" r="3" fill="${pal.highlight}" opacity="0.9" />
      `;

      const antennae = `
        <path d="M 30 24 Q 24 12 18 14" stroke="#0F172A" stroke-width="1.5" fill="none" stroke-linecap="round" />
        <circle cx="18" cy="14" r="2" fill="${pal.highlight}" />
        <path d="M 34 24 Q 40 12 46 14" stroke="#0F172A" stroke-width="1.5" fill="none" stroke-linecap="round" />
        <circle cx="46" cy="14" r="2" fill="${pal.highlight}" />
      `;

      art = `
        ${wings}
        ${antennae}
        <!-- Moth Body -->
        <ellipse cx="32" cy="36" rx="8" ry="14" fill="url(#grad)" stroke="#0F172A" stroke-width="2.2" />
        ${renderEyes(32, 30, 4.5, stage, pal)}
      `;
      break;
    }

    // --- Line 12: Dark Shadow Lord (Umbrata -> Shadeclaw -> Noctilord) ---
    case 12: {
      const horns = stage === 1
        ? `<polygon points="24,22 18,12 28,18" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.5" />
           <polygon points="40,22 46,12 36,18" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.5" />`
        : stage === 2
        ? `<path d="M 24 22 Q 14 6 22 4 Q 26 12 28 18 Z" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.8" />
           <path d="M 40 22 Q 50 6 42 4 Q 38 12 36 18 Z" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.8" />`
        : `<path d="M 22 22 Q 8 2 18 0 Q 24 10 28 18 Z" fill="${pal.accent}" stroke="#0F172A" stroke-width="2" />
           <polygon points="18,0 21,5 15,5" fill="${pal.eye}" />
           <path d="M 42 22 Q 56 2 46 0 Q 40 10 36 18 Z" fill="${pal.accent}" stroke="#0F172A" stroke-width="2" />
           <polygon points="46,0 49,5 43,5" fill="${pal.eye}" />`;

      const claws = stage >= 2
        ? `<path d="M 16 42 L 8 46 M 16 45 L 8 50 M 48 42 L 56 46 M 48 45 L 56 50" stroke="${pal.eye}" stroke-width="2" stroke-linecap="round" />`
        : '';

      const r = stage === 1 ? 14 : stage === 2 ? 17 : 21;
      art = `
        ${horns}
        ${claws}
        <ellipse cx="32" cy="38" rx="${r}" ry="${r * 0.85}" fill="url(#grad)" stroke="#0F172A" stroke-width="2.4" />
        <ellipse cx="32" cy="40" rx="${r * 0.5}" ry="${r * 0.4}" fill="${pal.accent}" opacity="0.9" />
        ${renderEyes(32, 33, stage === 1 ? 6 : 7.5, stage, pal, true)}
        ${renderMouth(32, 38.5, stage, true)}
      `;
      break;
    }

    // --- Line 13: Dark Gargoyle (Grimling -> Duskfang -> Maligoyle) ---
    case 13: {
      const batWings = stage === 1
        ? `<path d="M 22 34 Q 8 24 14 18 Q 20 28 24 32 Z" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.4" />
           <path d="M 42 34 Q 56 24 50 18 Q 44 28 40 32 Z" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.4" />`
        : `<path d="M 20 34 Q 2 20 10 12 Q 18 24 24 30 Z" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.8" />
           <path d="M 44 34 Q 62 20 54 12 Q 46 24 40 30 Z" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.8" />`;

      const r = stage === 1 ? 13 : stage === 2 ? 16 : 19;
      art = `
        ${batWings}
        <ellipse cx="32" cy="38" rx="${r}" ry="${r * 0.85}" fill="url(#grad)" stroke="#0F172A" stroke-width="2.4" />
        ${renderEyes(32, 33, stage === 1 ? 6 : 7, stage, pal, true)}
        ${renderMouth(32, 38, stage, true)}
      `;
      break;
    }

    // --- Line 14: Dragon Void (Wyrmlet -> Drakeon -> Dracovoid) ---
    case 14: {
      const horns = stage === 1
        ? `<polygon points="24,20 20,10 28,16" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.4" />
           <polygon points="40,20 44,10 36,16" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.4" />`
        : stage === 2
        ? `<path d="M 24 18 Q 14 2 24 2 Q 28 10 30 16 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.6" />
           <path d="M 40 18 Q 50 2 40 2 Q 36 10 34 16 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.6" />`
        : `<path d="M 22 18 Q 8 -2 20 -2 Q 26 8 28 16 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="2" />
           <polygon points="20,-2 23,4 17,4" fill="${pal.highlight}" />
           <path d="M 42 18 Q 56 -2 44 -2 Q 38 8 36 16 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="2" />
           <polygon points="44,-2 47,4 41,4" fill="${pal.highlight}" />`;

      const dragonWings = stage === 1
        ? `<path d="M 20 32 Q 8 24 16 18 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.4" />
           <path d="M 44 32 Q 56 24 48 18 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.4" />`
        : `<path d="M 18 32 Q 0 16 10 8 Q 18 20 22 28 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="2" />
           <path d="M 46 32 Q 64 16 54 8 Q 46 20 42 28 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="2" />`;

      const r = stage === 1 ? 14 : stage === 2 ? 17 : 21;
      art = `
        ${horns}
        ${dragonWings}
        <ellipse cx="32" cy="38" rx="${r}" ry="${r * 0.85}" fill="url(#grad)" stroke="#0F172A" stroke-width="2.4" />
        <ellipse cx="32" cy="41" rx="${r * 0.5}" ry="${r * 0.4}" fill="${pal.highlight}" opacity="0.8" />
        ${renderEyes(32, 33, stage === 1 ? 6.5 : 7.5, stage, pal)}
        ${renderMouth(32, 38.5, stage, stage === 3)}
      `;
      break;
    }

    // --- Line 15: Dragon Flame Serpent (Pyrowyrm -> Ignidrake -> Infernodragon) ---
    case 15: {
      const coils = `<path d="M 18 44 C 12 32, 26 28, 32 20 C 36 14, 48 16, 46 24 C 44 34, 22 36, 46 48 Z" fill="url(#grad)" stroke="#0F172A" stroke-width="2.5" />`;
      const flames = `<path d="M 32 10 Q 38 2 40 12 Q 46 4 48 18 Q 32 20 32 10 Z" fill="${pal.accent}" />`;

      art = `
        ${flames}
        ${coils}
        ${renderEyes(32, 22, 5, stage, pal)}
        ${renderMouth(32, 27, stage, stage === 3)}
      `;
      break;
    }

    // --- Line 16: Fly Storm Raptor (Skylark -> Zephyrcrane -> Stormfalcon) ---
    case 16: {
      const wings = stage === 1
        ? `<path d="M 18 36 Q 4 28 12 20 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.4" />
           <path d="M 46 36 Q 60 28 52 20 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.4" />`
        : `<path d="M 16 36 Q -2 20 8 10 Q 16 22 22 30 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.8" />
           <path d="M 48 36 Q 66 20 56 10 Q 48 22 42 30 Z" fill="${pal.secondary}" stroke="#0F172A" stroke-width="1.8" />`;

      const beak = `<polygon points="32,34 29,37 32,41 35,37" fill="#F59E0B" stroke="#0F172A" stroke-width="1.4" />`;
      const r = stage === 1 ? 14 : stage === 2 ? 17 : 20;

      art = `
        ${wings}
        <ellipse cx="32" cy="36" rx="${r}" ry="${r * 0.85}" fill="url(#grad)" stroke="#0F172A" stroke-width="2.2" />
        <ellipse cx="32" cy="38" rx="${r * 0.5}" ry="${r * 0.4}" fill="${pal.highlight}" opacity="0.8" />
        ${beak}
        ${renderEyes(32, 31, 6.5, stage, pal)}
      `;
      break;
    }

    // --- Line 17: Fly Cloud Roc (Featherpuff -> Cloudwing -> Stratobird) ---
    case 17: {
      const r = stage === 1 ? 16 : stage === 2 ? 19 : 23;
      const clouds = `
        <circle cx="20" cy="32" r="7" fill="${pal.highlight}" opacity="0.9" />
        <circle cx="44" cy="32" r="7" fill="${pal.highlight}" opacity="0.9" />
        <circle cx="32" cy="20" r="8" fill="${pal.highlight}" opacity="0.9" />
      `;

      art = `
        ${clouds}
        <ellipse cx="32" cy="38" rx="${r}" ry="${r * 0.8}" fill="url(#grad)" stroke="#0F172A" stroke-width="2.2" />
        <!-- Golden Beak -->
        <polygon points="32,35 29,38 32,42 35,38" fill="#F59E0B" stroke="#0F172A" stroke-width="1.4" />
        ${renderEyes(32, 31, 6.5, stage, pal)}
      `;
      break;
    }

    // --- Line 18: Fight Boxer (Boxerpup -> Champhound -> Titanor) ---
    case 18: {
      const boxingGloves = `
        <ellipse cx="14" cy="40" rx="7" ry="6" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.8" />
        <rect x="14" y="44" width="6" height="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1" />
        <ellipse cx="50" cy="40" rx="7" ry="6" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.8" />
        <rect x="44" y="44" width="6" height="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1" />
      `;

      const belt = stage >= 2
        ? `<rect x="20" y="43" width="24" height="6" rx="2" fill="${pal.shadow}" stroke="#0F172A" stroke-width="1.5" />
           <circle cx="32" cy="46" r="4" fill="#F59E0B" stroke="#0F172A" stroke-width="1.2" />`
        : '';

      const r = stage === 1 ? 14 : stage === 2 ? 17 : 21;
      art = `
        ${boxingGloves}
        <ellipse cx="32" cy="38" rx="${r}" ry="${r * 0.85}" fill="url(#grad)" stroke="#0F172A" stroke-width="2.4" />
        <ellipse cx="32" cy="40" rx="${r * 0.5}" ry="${r * 0.4}" fill="${pal.highlight}" opacity="0.75" />
        ${belt}
        ${renderEyes(32, 32, 6.5, stage, pal)}
        ${renderMouth(32, 37.5, stage, true)}
      `;
      break;
    }

    // --- Line 19: Fight Martial Sensei (Sparrk -> Brawlor -> Grandmaster) ---
    case 19: {
      const headband = `
        <rect x="16" y="22" width="32" height="5" rx="2" fill="${pal.accent}" stroke="#0F172A" stroke-width="1.4" />
        <!-- Headband flowing tails -->
        <path d="M 46 24 Q 58 20 62 28" stroke="${pal.accent}" stroke-width="2.5" fill="none" stroke-linecap="round" />
      `;

      const beard = stage === 3
        ? `<polygon points="26,38 32,48 38,38" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.4" />`
        : '';

      const r = stage === 1 ? 14 : stage === 2 ? 17 : 20;
      art = `
        ${headband}
        <ellipse cx="32" cy="38" rx="${r}" ry="${r * 0.85}" fill="url(#grad)" stroke="#0F172A" stroke-width="2.2" />
        ${beard}
        ${renderEyes(32, 30, 6, stage, pal)}
        ${renderMouth(32, 36, stage, stage === 3)}
      `;
      break;
    }

    // --- Line 20: Fight Armored Bear Colossus (Armadillo -> Crustox -> Ursumaul) ---
    case 20:
    default: {
      const bearEars = `
        <circle cx="20" cy="20" r="5" fill="${pal.shadow}" stroke="#0F172A" stroke-width="1.8" />
        <circle cx="20" cy="20" r="2.5" fill="${pal.secondary}" />
        <circle cx="44" cy="20" r="5" fill="${pal.shadow}" stroke="#0F172A" stroke-width="1.8" />
        <circle cx="44" cy="20" r="2.5" fill="${pal.secondary}" />
      `;

      const shoulderPads = stage >= 2
        ? `<polygon points="12,30 6,24 18,22" fill="${pal.shadow}" stroke="#0F172A" stroke-width="1.8" />
           <polygon points="52,30 58,24 46,22" fill="${pal.shadow}" stroke="#0F172A" stroke-width="1.8" />`
        : '';

      const r = stage === 1 ? 15 : stage === 2 ? 19 : 23;
      art = `
        ${bearEars}
        ${shoulderPads}
        <ellipse cx="32" cy="40" rx="${r}" ry="${r * 0.85}" fill="url(#grad)" stroke="#0F172A" stroke-width="2.6" />
        <ellipse cx="32" cy="42" rx="${r * 0.55}" ry="${r * 0.45}" fill="${pal.secondary}" opacity="0.8" />
        <!-- Big Snout -->
        <ellipse cx="32" cy="37" rx="5" ry="3.5" fill="${pal.shadow}" stroke="#0F172A" stroke-width="1.5" />
        <circle cx="32" cy="36" r="2" fill="#0F172A" />
        ${renderEyes(32, 31, 7, stage, pal)}
        ${renderMouth(32, 40, stage, true)}
      `;
      break;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <radialGradient id="grad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${pal.secondary}" />
      <stop offset="60%" stop-color="${pal.primary}" />
      <stop offset="100%" stop-color="${pal.accent}" />
    </radialGradient>
  </defs>
  ${shadow}
  ${aura}
  ${art}
</svg>`;
}

// Generate all 60 monster SVGs
for (const s of SPECIES) {
  const svg = generateMonsterSvg(s.lineId, s.stage, s.name, s.type);
  fs.writeFileSync(path.join(outputDir, `${s.id}.svg`), svg, 'utf-8');
}

console.log(`Successfully generated all ${SPECIES.length} bespoke stylized monster SVGs in ${outputDir}`);
