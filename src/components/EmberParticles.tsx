'use client';

import { useEffect, useState, type CSSProperties } from 'react';

interface Ember {
  id: number;
  left: number;
  delay: number;
  size: number;
  duration: number;
  driftX: number;
  peak: number;
  midDriftX: number;
  midPeak: number;
}

export default function EmberParticles({ count = 16 }: { count?: number }) {
  const [embers, setEmbers] = useState<Ember[]>([]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setEmbers(Array.from({ length: count }, () => ({
        id: Math.random(),
        left: Math.random() * 100,
        delay: Math.random() * 7,
        size: 5 + Math.random() * 6,
        duration: 5 + Math.random() * 5,
        driftX: -45 + Math.random() * 90,
        peak: 180 + Math.random() * 260,
        midDriftX: -12 + Math.random() * 24,
        midPeak: -(90 + Math.random() * 150),
      })));
    });

    return () => cancelAnimationFrame(frame);
  }, [count]);

  if (embers.length === 0) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {embers.map((e) => (
        <div
          key={e.id}
          className="absolute"
          style={{
            left: `${e.left}%`,
            bottom: '-8px',
            width: `${e.size}px`,
            height: `${e.size}px`,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fff7ed 0%, #fdba74 25%, #fb923c 48%, #f97316 68%, transparent 78%)',
            boxShadow: `0 0 ${e.size * 6}px rgba(251, 146, 60, 1), 0 0 ${e.size * 13}px rgba(234, 88, 12, 0.48)`,
            '--ember-drift': `${e.driftX}px`,
            '--ember-peak': `-${e.peak}px`,
            '--ember-mid-drift': `${e.midDriftX}px`,
            '--ember-mid-peak': `${e.midPeak}px`,
            animation: `ember-rise ${e.duration}s cubic-bezier(.22,.61,.36,1) ${e.delay}s infinite`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
