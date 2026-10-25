'use client';

import { Mic, Pause, Play } from 'lucide-react';

interface LyricFollowControlsProps {
  listening: boolean;
  paused: boolean;
  onToggleListen: () => void;
  onTogglePause: () => void;
}

export default function LyricFollowControls({
  listening,
  paused,
  onToggleListen,
  onTogglePause,
}: LyricFollowControlsProps) {
  return (
    <div className="flex items-center gap-0.5 shrink-0" role="group" aria-label="Seguimiento por audio" data-lyric-follow-controls>
      <button
        type="button"
        onClick={onToggleListen}
        aria-pressed={listening}
        aria-label={listening ? 'Detener seguimiento por audio' : 'Iniciar seguimiento por audio'}
        title={listening ? 'Detener seguimiento por audio' : 'Seguimiento por audio'}
        data-listening={listening ? 'true' : 'false'}
        className={`relative p-1.5 rounded-lg transition-all ${
          listening ? 'lyric-mic-live bg-terracotta/25' : 'hover:bg-terracotta/15'
        }`}
      >
        <Mic
          className="w-4 h-4"
          style={{ color: listening ? 'var(--color-warm-tan)' : 'var(--text-secondary)' }}
        />
      </button>
      {listening && (
        <button
          type="button"
          onClick={onTogglePause}
          aria-pressed={paused}
          aria-label={paused ? 'Reanudar seguimiento' : 'Pausar seguimiento'}
          title={paused ? 'Reanudar seguimiento' : 'Pausar seguimiento'}
          data-paused={paused ? 'true' : 'false'}
          className={`p-1.5 rounded-lg transition-all ${
            paused ? 'bg-terracotta/25' : 'hover:bg-terracotta/15'
          }`}
        >
          {paused ? (
            <Play className="w-4 h-4" style={{ color: 'var(--color-warm-tan)' }} />
          ) : (
            <Pause className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          )}
        </button>
      )}
    </div>
  );
}

export function LyricFollowNotice({ message, compact = false }: { message: string | null; compact?: boolean }) {
  if (!message) return null;
  return (
    <p
      role="status"
      aria-live="polite"
      className={compact ? 'px-4 py-2 text-sm leading-snug' : 'mt-2 mb-1 rounded-xl px-3 py-2 text-sm leading-snug'}
      style={{ color: 'var(--text-primary)', background: 'rgba(217, 119, 6, 0.14)' }}
    >
      {message}
    </p>
  );
}
