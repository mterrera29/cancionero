export function Campfire({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <ellipse cx="60" cy="95" rx="30" ry="8" fill="var(--text-muted)" opacity="0.2" />
      <path d="M60 85C60 85 45 65 50 50C54 38 60 30 60 30C60 30 66 38 70 50C75 65 60 85 60 85Z" fill="#D97706" opacity="0.6" />
      <path d="M60 85C60 85 50 70 53 58C56 48 60 40 60 40C60 40 64 48 67 58C70 70 60 85 60 85Z" fill="#E89933" opacity="0.8" />
      <path d="M60 80C60 80 55 68 57 60C59 54 60 48 60 48C60 48 61 54 63 60C65 68 60 80 60 80Z" fill="#FDE68A" opacity="0.6" />
      <path d="M48 78C48 78 52 72 56 72C60 72 64 78 64 78" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <path d="M56 78C56 78 58 74 60 74C62 74 64 78 64 78" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

export function Guitar({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <rect x="54" y="20" width="12" height="40" rx="3" fill="var(--text-muted)" opacity="0.3" />
      <rect x="51" y="55" width="18" height="4" rx="2" fill="var(--text-muted)" opacity="0.2" />
      <circle cx="60" cy="75" r="20" stroke="#D97706" strokeWidth="2" fill="none" opacity="0.5" />
      <circle cx="60" cy="75" r="12" stroke="#E89933" strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="60" cy="75" r="4" fill="#E89933" opacity="0.4" />
      <line x1="60" y1="20" x2="60" y2="12" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <line x1="60" y1="12" x2="52" y2="16" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <line x1="60" y1="12" x2="68" y2="16" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

export function Candle({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <rect x="52" y="45" width="16" height="35" rx="3" fill="#D97706" opacity="0.25" />
      <rect x="54" y="48" width="12" height="30" rx="2" fill="#E89933" opacity="0.5" />
      <path d="M60 45C60 45 50 35 53 28C55 23 60 18 60 18C60 18 65 23 67 28C70 35 60 45 60 45Z" fill="#D97706" opacity="0.7" />
      <path d="M60 42C60 42 54 34 56 29C57.5 25.5 60 22 60 22C60 22 62.5 25.5 64 29C66 34 60 42 60 42Z" fill="#FDE68A" opacity="0.8" />
      <ellipse cx="60" cy="90" rx="14" ry="3" fill="var(--text-muted)" opacity="0.15" />
      <line x1="52" y1="80" x2="52" y2="85" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <line x1="68" y1="80" x2="68" y2="85" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

export function Moon({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <circle cx="55" cy="55" r="30" fill="#D4A373" opacity="0.15" />
      <path d="M52 35C45 42 45 58 52 68C59 78 68 78 75 75C65 78 52 70 48 60C44 50 46 40 52 35Z" fill="#D4A373" opacity="0.7" />
      <circle cx="70" cy="42" r="1.5" fill="#D4A373" opacity="0.4" />
      <circle cx="74" cy="50" r="1" fill="#D4A373" opacity="0.35" />
      <circle cx="68" cy="55" r="1.2" fill="#D4A373" opacity="0.3" />
      <circle cx="65" cy="63" r="0.8" fill="#D4A373" opacity="0.3" />
      <circle cx="78" cy="60" r="0.8" fill="#D4A373" opacity="0.25" />
    </svg>
  );
}

export function StarryNight({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <rect x="0" y="0" width="120" height="120" rx="16" fill="#1C1816" opacity="0.6" />
      <circle cx="20" cy="18" r="1.5" fill="#D4A373" opacity="0.5" />
      <circle cx="45" cy="12" r="1" fill="#D4A373" opacity="0.4" />
      <circle cx="80" cy="22" r="1.8" fill="#D4A373" opacity="0.6" />
      <circle cx="100" cy="15" r="1" fill="#D4A373" opacity="0.35" />
      <circle cx="15" cy="40" r="1.2" fill="#D4A373" opacity="0.45" />
      <circle cx="95" cy="45" r="1.5" fill="#D4A373" opacity="0.5" />
      <circle cx="110" cy="35" r="1" fill="#D4A373" opacity="0.3" />
      <circle cx="30" cy="55" r="1.3" fill="#D4A373" opacity="0.4" />
      <circle cx="85" cy="60" r="1.8" fill="#D4A373" opacity="0.55" />
      <circle cx="105" cy="70" r="1" fill="#D4A373" opacity="0.35" />
      <circle cx="10" cy="70" r="1.2" fill="#D4A373" opacity="0.3" />
      <circle cx="50" cy="30" r="1" fill="#D4A373" opacity="0.35" />
      <circle cx="65" cy="15" r="1.5" fill="#D4A373" opacity="0.5" />
      <circle cx="35" cy="75" r="1" fill="#D4A373" opacity="0.3" />
      <circle cx="75" cy="75" r="1.2" fill="#D4A373" opacity="0.35" />
    </svg>
  );
}

export function CozyLeaf({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path d="M20 8C20 8 12 16 12 24C12 30 18 34 20 34C22 34 28 30 28 24C28 16 20 8 20 8Z" fill="#A3B18A" opacity="0.3" />
      <path d="M20 12C20 12 15 18 15 24C15 28 18 31 20 31C22 31 25 28 25 24C25 18 20 12 20 12Z" fill="#A3B18A" opacity="0.5" />
      <path d="M20 8L20 34" stroke="#8A9B72" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export function CoffeeCup({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true" opacity="0.6">
      <path d="M30 45C30 45 32 78 48 80C64 82 56 78 72 80C88 82 90 45 90 45H30Z" fill="var(--text-muted)" stroke="#D97706" strokeWidth="1.5" />
      <path d="M38 50C38 50 40 72 48 73C56 74 52 72 60 73C68 74 70 50 70 50H38Z" fill="var(--text-muted)" />
      <path d="M70 50C70 50 78 52 82 56C86 60 84 68 82 70C78 74 70 72 70 72" stroke="#D97706" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M42 82C42 82 48 90 60 90C72 90 78 82 78 82" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <path d="M48 44C48 44 46 38 48 34" stroke="#D97706" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <path d="M56 44C56 44 54 36 56 32" stroke="#D97706" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      <path d="M64 44C64 44 62 38 64 35" stroke="#D97706" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

export function Flame({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M8 14C8 14 5 10 5.5 7C5.8 5 8 3 8 3C8 3 10.2 5 10.5 7C11 10 8 14 8 14Z" fill="currentColor" opacity="0.35" />
      <path d="M8 13C8 13 6 10 6.3 7.8C6.5 6.2 8 4.5 8 4.5C8 4.5 9.5 6.2 9.7 7.8C10 10 8 13 8 13Z" fill="currentColor" opacity="0.6" />
      <path d="M8 11.5C8 11.5 7 9.5 7.2 8.2C7.3 7.2 8 6 8 6C8 6 8.7 7.2 8.8 8.2C9 9.5 8 11.5 8 11.5Z" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

export function OpenBook({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true" opacity="0.6">
      <path d="M20 35L60 30L100 35V85L60 90L20 85V35Z" stroke="#D97706" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M60 30V90" stroke="#D97706" strokeWidth="1.5" opacity="0.4" />
      <path d="M30 40L60 36V82L30 86V40Z" fill="var(--text-muted)" stroke="#D97706" strokeWidth="1" strokeLinejoin="round" opacity="0.4" />
      <path d="M90 40L60 36V82L90 86V40Z" fill="var(--text-muted)" stroke="#D97706" strokeWidth="1" strokeLinejoin="round" opacity="0.4" />
    </svg>
  );
}
