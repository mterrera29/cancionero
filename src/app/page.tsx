'use client';

import { useRouter } from 'next/navigation';
import { Music, LogIn, Users } from 'lucide-react';
import Header from '@/components/Header';
import { BonfireHero } from '@/components/BonfireHero';
import { useAuth } from '@/hooks/useAuth';

const FEATURES = [
  { icon: '🎵', title: 'Letras y Acordes', desc: 'Buscá canciones, guardá tus favoritas y accedé a las letras con acordes en un solo lugar.' },
  { icon: '🔥', title: 'Modo Fogón', desc: 'Activá el scroll automático con velocidad ajustable y disfrutá mientras tocás.' },
  { icon: '📋', title: 'Listas Inteligentes', desc: 'Agrupá canciones por setlist, género o lo que se te ocurra.' },
  { icon: '🌙', title: 'Modo Horizontal', desc: 'Dos columnas simultáneas para ver letra y acordes lado a lado.' },
];

export default function HomePage() {
  const router = useRouter();
  const { userId, login } = useAuth();

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 pb-12 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <BonfireHero className="w-48 h-48 sm:w-64 sm:h-64 animate-cozy-bounce" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Cancionero
          </h1>
          <p className="text-base sm:text-lg max-w-lg mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
            Tus canciones, tus acordes, tu fogón. Guardá letras, seguí el ritmo y llevá tu repertorio a todas partes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {!userId && (
              <button
                onClick={login}
                className="btn-cozy inline-flex items-center gap-2 bg-warm-tan hover:bg-dusty-rose text-charcoal font-semibold px-8 py-3.5 transition-all shadow-md hover:shadow-lg text-base hover:scale-105"
              >
                <LogIn className="w-5 h-5" /> Comenzar
              </button>
            )}
            <button
              onClick={() => router.push('/canciones-publicas')}
              className="btn-cozy inline-flex items-center gap-2 bg-warm-tan/15 hover:bg-warm-tan/30 text-warm-tan font-semibold px-7 py-3.5 transition-all shadow-sm hover:shadow-md text-base hover:scale-105 border border-warm-tan/40"
            >
              <Users className="w-5 h-5" /> Canciones Públicas
            </button>
            {userId && (
              <button
                onClick={() => router.push('/mis-canciones')}
                className="btn-cozy inline-flex items-center gap-2 bg-dusty-rose/15 hover:bg-dusty-rose/30 text-dusty-rose font-semibold px-7 py-3.5 transition-all shadow-sm hover:shadow-md text-base hover:scale-105 border border-dusty-rose/40"
              >
                <Music className="w-5 h-5" /> Mis Canciones
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`rounded-2xl p-5 sm:p-6 transition-all hover:scale-[1.02] animate-enter stagger-${Math.min(i + 1, 4)}`}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              >
                <span className="text-2xl mb-3 block">{f.icon}</span>
                <h3 className="text-base font-heading mb-1.5" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Cancionero — hecho con ❤️ y 🔥 para músicos
          </p>
        </div>
      </footer>
    </main>
  );
}
