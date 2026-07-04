'use client';

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

function FlameIcon({ className = "absolute inset-0 w-full h-full p-2 opacity-45" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M20 36 C12 36,7 31,9 24 C11 19,14 13,18 8 C19 6,20 4,21 3 C23 7,25 12,28 17 C31 22,33 28,29 34 C27 36,24 36,20 36Z"
        fill="rgba(255,255,255,0.5)"
      />
      <path
        d="M20 32 C15 32,12 29,13 24 C14 20,17 16,20 10 C23 16,26 20,27 24 C28 29,25 32,20 32Z"
        fill="rgba(255,255,255,0.25)"
      />
    </svg>
  );
}

function GenreSvg() {
  return <FlameIcon />;
}

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

  return (
    <div
      className={`shrink-0 overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: size > 60 ? 16 : 10,
        background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]}, ${palette[2]})`,
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: pattern }} />
      <GenreSvg />
    </div>
  );
}
