'use client';

import { BonfireHero } from './BonfireHero';

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const GENRE_MAP: Record<string, { palette: [string, string, string] }> = {
  rock:        { palette: ['#D97706', '#B86400', '#78350F'] },
  metal:       { palette: ['#92400E', '#78350F', '#451A03'] },
  indie:       { palette: ['#D4A373', '#B5835A', '#8D6B46'] },
  blues:       { palette: ['#B86400', '#92400E', '#78350F'] },
  folk:        { palette: ['#E89933', '#D97706', '#B86400'] },
  folklore:    { palette: ['#D97706', '#B86400', '#92400E'] },
  country:     { palette: ['#A8C4A0', '#88A480', '#6A8462'] },
  acoustic:    { palette: ['#D4A373', '#B5835A', '#8D6B46'] },
  classical:   { palette: ['#DCA9A9', '#C48989', '#A86A6A'] },
  opera:       { palette: ['#DCA9A9', '#D4A373', '#C48989'] },
  choir:       { palette: ['#A8C4A0', '#88A480', '#DCA9A9'] },
  jazz:        { palette: ['#D4A373', '#E89933', '#D97706'] },
  lounge:      { palette: ['#D4A373', '#B5835A', '#8D6B46'] },
  chill:       { palette: ['#DCA9A9', '#D4A373', '#C48989'] },
  ambient:     { palette: ['#D4A373', '#C48989', '#A86A6A'] },
  electronic:  { palette: ['#78350F', '#92400E', '#B86400'] },
  'lo-fi':     { palette: ['#DCA9A9', '#D4A373', '#C48989'] },
  'lofi':      { palette: ['#DCA9A9', '#D4A373', '#C48989'] },
  reggae:      { palette: ['#A8C4A0', '#88A480', '#6A8462'] },
  soul:        { palette: ['#E89933', '#D97706', '#B86400'] },
  'r&b':       { palette: ['#DCA9A9', '#C48989', '#A86A6A'] },
  pop:         { palette: ['#E89933', '#D4A373', '#D97706'] },
  'dream pop': { palette: ['#DCA9A9', '#D4A373', '#A8C4A0'] },
};

const PALETTES: [string, string, string][] = [
  ['#D97706', '#B86400', '#92400E'],
  ['#D4A373', '#B5835A', '#8D6B46'],
  ['#DCA9A9', '#C48989', '#A86A6A'],
  ['#A8C4A0', '#88A480', '#6A8462'],
  ['#E89933', '#D97706', '#B86400'],
  ['#D4A373', '#E89933', '#D97706'],
  ['#B86400', '#92400E', '#78350F'],
  ['#DCA9A9', '#D4A373', '#C48989'],
  ['#A8C4A0', '#88A480', '#DCA9A9'],
  ['#78350F', '#92400E', '#B86400'],
];

const PATTERNS = [
  'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08) 0%, transparent 50%)',
  'radial-gradient(circle at 70% 80%, rgba(255,255,255,0.06) 0%, transparent 40%)',
  'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.1) 0%, transparent 45%)',
  'radial-gradient(circle at 80% 30%, rgba(255,255,255,0.07) 0%, transparent 50%)',
  'radial-gradient(circle at 20% 70%, rgba(255,255,255,0.09) 0%, transparent 40%)',
];

interface CozyCoverProps {
  seed: string;
  genre?: string;
  size?: number;
  className?: string;
}

export default function CozyCover({ seed, genre, size = 80, className = '' }: CozyCoverProps) {
  const h = hashSeed(seed);
  const normalized = (genre || '').toLowerCase().trim();

  let palette: [string, string, string];

  if (normalized && GENRE_MAP[normalized]) {
    palette = GENRE_MAP[normalized].palette;
  } else {
    palette = PALETTES[h % PALETTES.length];
  }

  const pattern = PATTERNS[h % PATTERNS.length];
  const angle = 120 + (h % 4) * 18;

  return (
    <div
      className={`shrink-0 overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: size > 60 ? 20 : 10,
        background: `linear-gradient(${angle}deg, ${palette[2]}, ${palette[1]} 54%, ${palette[0]})`,
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: pattern }} />
      <div style={{ position: 'absolute', width: '75%', height: '75%', left: '-25%', bottom: '-35%', borderRadius: '50%', background: 'rgba(234, 88, 12, 0.42)', filter: 'blur(18px)' }} />
      <div style={{ position: 'absolute', width: '42%', height: '42%', right: '-15%', top: '-15%', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)' }} />
      <BonfireHero className="absolute inset-[7%] h-[86%] w-[86%]" />
    </div>
  );
}
