'use client';

import { useRef, useEffect } from 'react';

interface SongContentViewProps {
  lyrics?: string;
  chords?: string;
  activeTab: string;
  fontSize: number;
  lineHeight: number;
  displayMode: 'vertical' | 'horizontal';
}

export default function SongContentView({ lyrics, chords, activeTab, fontSize, lineHeight, displayMode }: SongContentViewProps) {
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
    <HorizontalView lines={lines} fontSize={fontSize} lineHeight={lineHeight} />
  );
}

function HorizontalView({ lines, fontSize, lineHeight }: { lines: string[]; fontSize: number; lineHeight: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resize = () => {
      // Altura disponible: vh menos espacio del header/tabs y bottom bar
      const availableH = window.innerHeight - 280; // padding + header + tabs + bottom bar
      const lineH = fontSize * lineHeight + 12; // fontSize * lineHeight + padding vertical
      const itemsPerCol = Math.max(1, Math.floor(availableH / lineH));
      const totalCols = Math.ceil(lines.length / itemsPerCol);

      // Ancho de columna basado en el contenido más largo
      let maxW = 220;
      // Estimación: ~0.6 * fontSize por caracter
      lines.forEach(l => {
        const w = l.length * fontSize * 0.55 + 32; // 32px de padding lateral
        if (w > maxW) maxW = w;
      });
      maxW = Math.min(maxW, 400); // cap

      el.style.columnCount = String(totalCols);
      el.style.columnWidth = `${maxW}px`;
      el.style.height = `${itemsPerCol * lineH}px`;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [lines, fontSize, lineHeight]);

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto overflow-y-hidden"
      style={{
        fontSize: `${fontSize}px`,
        color: 'var(--text-primary)',
        columnFill: 'auto',
        columnGap: '2rem',
        columnRule: '1px solid var(--border-color)',
        paddingBottom: '1rem',
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
