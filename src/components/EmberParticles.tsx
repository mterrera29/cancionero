'use client';

import { useEffect, useState } from 'react';

interface Ember {
  id: number;
  left: number;
  delay: number;
  size: number;
  duration: number;
  driftX: number;
}

export default function EmberParticles({ count = 16 }: { count?: number }) {
  const [embers, setEmbers] = useState<Ember[]>([]);

  useEffect(() => {
    setEmbers(
      Array.from({ length: count }, () => ({
        id: Math.random(),
        left: Math.random() * 100,
        delay: Math.random() * 2,
        size: 3 + Math.random() * 5,
        duration: 5 + Math.random() * 5,
        driftX: -20 + Math.random() * 40,
      }))
    );
  }, [count]);

  if (embers.length === 0) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {embers.map((e) => (
        <div
          key={e.id}
          className="absolute"
          style={{
            left: `${e.left}%`,
            bottom: '-10px',
            width: `${e.size}px`,
            height: `${e.size}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(253, 224, 71, 0.8), rgba(251, 146, 60, 0.4), transparent)`,
            boxShadow: `0 0 ${e.size * 5}px rgba(251, 146, 60, 0.3), 0 0 ${e.size * 10}px rgba(217, 119, 6, 0.1)`,
            animation: `ember-rise ${e.duration}s ease-out ${e.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
