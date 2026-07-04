export function BonfireHero({ className = "w-64 h-64" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 200" fill="none" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="glow" cx="70" cy="120" r="50%">
          <stop offset="0%" stopColor="#D97706" stopOpacity="0.2" />
          <stop offset="60%" stopColor="#D97706" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="70" cy="120" r="65" fill="url(#glow)" />

      <path d="M55 185 C30 185 10 155 15 120 C20 85 36 48 60 22 C63 18 67 14 70 22 C96 48 112 85 117 120 C122 155 105 185 78 185 C73 188 60 188 55 185Z" fill="#D97706" opacity="0.5" />
      <path d="M58 179 C35 179 16 151 21 120 C26 90 40 55 62 32 C65 28 68 24 71 32 C92 55 106 90 111 120 C116 151 100 179 78 179 C74 182 62 182 58 179Z" fill="#F59E0B" opacity="0.7" />
      <path d="M61 173 C40 173 22 147 27 120 C32 95 44 62 64 42 C66 38 69 34 72 42 C88 62 100 95 105 120 C110 147 95 173 78 173 C74 176 64 176 61 173Z" fill="#FDE68A" opacity="0.6" />
      <path d="M64 167 C46 167 30 143 34 120 C38 100 48 72 66 54 C68 50 70 46 72 54 C84 72 94 100 98 120 C102 143 90 167 78 167 C74 170 68 170 64 167Z" fill="#FEF9C3" opacity="0.5" />

      <path d="M40 182 C36 174 32 168 38 162 C44 168 46 174 40 182Z" fill="#EA580C" opacity="0.4" />
      <path d="M95 182 C99 174 103 168 97 162 C91 168 89 174 95 182Z" fill="#EA580C" opacity="0.4" />
      <path d="M35 186 C32 180 28 176 34 170 C40 176 40 180 35 186Z" fill="#D97706" opacity="0.3" />
      <path d="M100 186 C103 180 107 176 101 170 C95 176 95 180 100 186Z" fill="#D97706" opacity="0.3" />

      <circle cx="22" cy="65" r="1.5" fill="#FDE68A" />
      <circle cx="118" cy="70" r="1.5" fill="#FDE68A" />
      <circle cx="35" cy="30" r="1" fill="#FEF9C3" />
      <circle cx="105" cy="35" r="1" fill="#FEF9C3" />
      <circle cx="55" cy="14" r="1.2" fill="#FDE68A" />
      <circle cx="80" cy="16" r="1.2" fill="#FDE68A" />
      <circle cx="15" cy="45" r="1" fill="#F59E0B" />
      <circle cx="125" cy="50" r="1" fill="#F59E0B" />
      <circle cx="45" cy="50" r="1" fill="#FEF9C3" />
      <circle cx="90" cy="52" r="1" fill="#FEF9C3" />
    </svg>
  );
}
