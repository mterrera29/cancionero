'use client';

import { useRef, useEffect, forwardRef } from 'react';

interface SongContentViewProps {
  lyrics?: string;
  chords?: string;
  activeTab: string;
  fontSize: number;
  lineHeight: number;
  displayMode: 'vertical' | 'horizontal';
  horizontalScrollRef?: React.Ref<HTMLDivElement>;
}

export default function SongContentView({ lyrics, chords, activeTab, fontSize, lineHeight, displayMode, horizontalScrollRef }: SongContentViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const content = activeTab === 'lyrics' ? lyrics : chords;

  if (!content) {
    return (
      <div className="text-center py-12 text-sm italic" style={{ color: 'var(--text-muted)' }}>
        {activeTab === 'chords' ? 'No hay acordes disponibles.' : 'No hay letra disponible.'}
      </div>
    );
  }

  const lines = content.split('\n');

  // ── Modo vertical: una columna, scroll Y ──
  if (displayMode === 'vertical') {
    return (
      <div className="px-1" style={{ fontSize: `${fontSize}px`, color: 'var(--text-primary)' }}>
        {lines.map((line, i) => (
          <div
            key={i}
            className={`px-3 py-1.5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
            style={{ color: line.trim() === '' ? 'transparent' : 'var(--text-primary)', lineHeight }}
          >
            {line || '\u00A0'}
          </div>
        ))}
      </div>
    );
  }

  // ── Modo horizontal: columnas que llenan el vh, scroll X ──
  return (
    <HorizontalView ref={horizontalScrollRef} lines={lines} fontSize={fontSize} lineHeight={lineHeight} />
  );
}

const HorizontalView = forwardRef<HTMLDivElement, { lines: string[]; fontSize: number; lineHeight: number }>(
  ({ lines, fontSize, lineHeight }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const resize = () => {
        const parent = el.parentElement;
        if (!parent) return;
        const availableH = parent.clientHeight;
        const lineH = fontSize * lineHeight + 12;
        const itemsPerCol = Math.max(1, Math.floor(availableH / lineH));

        el.style.height = `${availableH}px`;

        if (lines.length <= itemsPerCol) {
          el.style.columnCount = '1';
          el.style.columnWidth = 'auto';
          return;
        }

        const totalCols = Math.ceil(lines.length / itemsPerCol);

        let maxW = 220;
        lines.forEach(l => {
          const w = l.length * fontSize * 0.55 + 32;
          if (w > maxW) maxW = w;
        });
        maxW = Math.min(maxW, 400);

        el.style.columnCount = String(totalCols);
        el.style.columnWidth = `${maxW}px`;
      };

      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }, [lines, fontSize, lineHeight]);

    // Scroll horizontal con la rueda del mouse
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      };
      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }, []);

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className="overflow-x-auto overflow-y-hidden"
        style={{
          fontSize: `${fontSize}px`,
          color: 'var(--text-primary)',
          columnFill: 'auto',
          columnGap: '2rem',
          columnRule: '1px solid var(--border-color)',
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className="break-inside-avoid px-3 py-1.5"
            style={{
              color: line.trim() === '' ? 'transparent' : 'var(--text-primary)',
              lineHeight,
              background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
            }}
          >
            {line || '\u00A0'}
          </div>
        ))}
      </div>
    );
  }
);
HorizontalView.displayName = 'HorizontalView';
