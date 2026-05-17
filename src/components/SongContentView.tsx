'use client';

interface SongContentViewProps {
  lyrics?: string;
  chords?: string;
  activeTab: string;
  fontSize: number;
  lineHeight: number;
  columns: number;
}

export default function SongContentView({ lyrics, chords, activeTab, fontSize, lineHeight, columns }: SongContentViewProps) {
  const content = activeTab === 'lyrics' ? lyrics : chords;

  if (!content) {
    return (
      <div className="text-center py-12 text-sm italic" style={{ color: 'var(--text-muted)' }}>
        {activeTab === 'chords' ? 'No hay acordes disponibles.' : 'No hay letra disponible.'}
      </div>
    );
  }

  const lines = content.split('\n');

  return (
    <div
      className="px-1"
      style={{
        fontSize: `${fontSize}px`,
        color: 'var(--text-primary)',
        columnCount: columns,
        columnGap: '2rem',
        columnRule: columns > 1 ? '1px solid var(--border-color)' : 'none',
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          className={`${i % 2 === 0 ? 'bg-white/[0.02]' : ''} ${columns > 1 ? 'break-inside-avoid px-2 py-1' : 'px-3 py-1.5'}`}
          style={{ color: line.trim() === '' ? 'transparent' : 'var(--text-primary)', lineHeight }}
        >
          {line || '\u00A0'}
        </div>
      ))}
    </div>
  );
}