export function BonfireHero({ className = 'w-64 h-64' }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 280" fill="none" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="bonfire-glow" cx="50%" cy="64%" r="48%">
          <stop offset="0%" stopColor="#FED7AA" stopOpacity=".82" />
          <stop offset="28%" stopColor="#FB923C" stopOpacity=".34" />
          <stop offset="68%" stopColor="#EA580C" stopOpacity=".09" />
          <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="outer-flame" x1="80" y1="230" x2="177" y2="47" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C2410C" /><stop offset=".55" stopColor="#EA580C" /><stop offset="1" stopColor="#FB923C" />
        </linearGradient>
        <linearGradient id="inner-flame" x1="130" y1="218" x2="130" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EA580C" /><stop offset=".55" stopColor="#FB923C" /><stop offset="1" stopColor="#FED7AA" />
        </linearGradient>
        <filter id="fire-blur"><feGaussianBlur stdDeviation="8" /></filter>
      </defs>
      <ellipse cx="130" cy="195" rx="118" ry="82" fill="url(#bonfire-glow)" />
      <ellipse cx="130" cy="226" rx="82" ry="13" fill="#090706" opacity=".48" />
      <g opacity=".58" filter="url(#fire-blur)"><path d="M130 226C69 226 70 169 94 128c18-31 21-64 17-84 41 29 57 64 55 91 17-20 27-40 26-62 34 43 34 90 7 128-15 21-38 25-69 25Z" fill="#F97316" /></g>
      <path d="M130 226c-46 0-69-32-63-70 5-32 31-54 38-87 3-15 2-28-2-39 43 25 60 67 49 106 19-18 29-39 28-59 31 42 27 88 1 119-14 17-30 30-51 30Z" fill="url(#outer-flame)" />
      <path d="M133 219c-28 0-43-20-38-45 4-20 22-37 25-59 2-11 1-21-2-29 27 20 37 47 29 70 13-12 19-25 19-39 20 29 16 61-3 83-9 11-18 19-30 19Z" fill="url(#inner-flame)" />
      <path d="M133 215c-14 0-24-11-22-25 2-12 12-22 15-36 14 15 17 31 11 45 7-6 10-13 10-21 11 15 8 28-2 37Z" fill="#FED7AA" opacity=".92" />
      <path d="M63 220 183 242" stroke="#5C2D18" strokeWidth="17" strokeLinecap="round" /><path d="m77 218 104 24" stroke="#8D4923" strokeWidth="9" strokeLinecap="round" />
      <path d="m197 220-120 22" stroke="#6B341B" strokeWidth="17" strokeLinecap="round" /><path d="m184 218-104 23" stroke="#9B5529" strokeWidth="9" strokeLinecap="round" />
      <g className="bonfire-sparks">
        <circle className="bonfire-spark bonfire-spark-one" cx="113" cy="148" r="3.5" fill="#FED7AA" />
        <circle className="bonfire-spark bonfire-spark-two" cx="151" cy="143" r="3" fill="#FB923C" />
        <circle className="bonfire-spark bonfire-spark-three" cx="128" cy="127" r="2.5" fill="#FFEDD5" />
        <circle className="bonfire-spark bonfire-spark-four" cx="102" cy="165" r="2.5" fill="#F97316" />
        <circle className="bonfire-spark bonfire-spark-five" cx="162" cy="163" r="3" fill="#FED7AA" />
      </g>
    </svg>
  );
}
