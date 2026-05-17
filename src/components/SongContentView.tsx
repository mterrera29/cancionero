'use client';

interface SongContentViewProps {
  lyrics?: string;
  chords?: string;
  activeTab: string;
  fontSize: number;
  lineHeight: number;
}

export default function SongContentView({ lyrics, chords, activeTab, fontSize, lineHeight }: SongContentViewProps) {
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