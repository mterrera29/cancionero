'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Columns3, Library, List, LogIn, PenLine, Search, Sparkles, Users } from 'lucide-react';
import Header from '@/components/Header';
import { BonfireHero } from '@/components/BonfireHero';
import Modal from '@/components/Modal';
import NewSongForm from '@/components/NewSongForm';
import SongSearchInputs from '@/components/SongSearchInputs';
import CozyCover from '@/components/CozyCover';
import { useAuth } from '@/hooks/useAuth';

const FEATURES = [
  { icon: PenLine, title: 'Creá tus canciones', desc: 'Escribí letras y acordes desde cero, guardalos y convertí cada idea en parte de tu repertorio.' },
  { icon: Search, title: 'Buscá y completá', desc: 'Encontrá letras o acordes en fuentes externas y sumalos a tu propia versión de la canción.' },
  { icon: Users, title: 'Compartí el fogón', desc: 'Publicá tus canciones o explorá las que otros artistas decidieron compartir.' },
];

const PLANS = [
  {
    name: 'Fogón Free',
    price: 'Gratis',
    description: 'Para empezar a ordenar las canciones que ya son tuyas.',
    items: ['Hasta 20 canciones propias', 'Hasta 3 listas', 'Letras, acordes y modo fogón'],
    featured: false,
  },
  {
    name: 'Escenario',
    price: 'Ilimitado',
    description: 'Para músicos con un repertorio que no para de crecer.',
    items: ['Canciones propias ilimitadas', 'Listas y setlists ilimitados', 'Todo lo que incluye Free'],
    featured: true,
  },
];

type FoundSong = {
  title: string;
  artist: string;
  lyrics?: string;
  chords?: string;
  cover?: string;
};

export default function HomePage() {
  const { userId, login } = useAuth();
  const primaryHref = userId ? '/mis-canciones' : undefined;
  const [newSongData, setNewSongData] = useState<FoundSong | null>(null);
  const [showNewSongModal, setShowNewSongModal] = useState(false);
  const [readerTab, setReaderTab] = useState<'lyrics' | 'chords'>('lyrics');

  function selectSong(data: FoundSong) {
    if (!userId) {
      login();
      return;
    }

    setNewSongData(data);
    setShowNewSongModal(true);
  }

  return (
    <main className="min-h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Header />

      <section className="relative isolate px-4 pb-20 pt-10 sm:px-6 sm:pb-28 sm:pt-16">
        <div className="hero-halo absolute left-1/2 top-[-16rem] -z-10 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div className="max-w-2xl text-center lg:text-left">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-fogon/30 bg-fogon/10 px-3 py-1.5 text-xs font-semibold tracking-[0.16em] text-fogon-light uppercase">
              <Sparkles className="size-3.5" /> Tu música tiene casa
            </p>
            <h1 className="font-heading text-5xl leading-[0.95] tracking-[-0.045em] sm:text-6xl lg:text-7xl" style={{ color: 'var(--text-primary)' }}>
              Llevá cada canción
              <span className="block text-fogon-light">a tu próximo fogón.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
              fogon.app es el espacio simple para artistas: guardá tus letras, afiná tus acordes y armá el repertorio para tocar sin perder el momento.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              {primaryHref ? (
                <Link href={primaryHref} className="btn-cozy inline-flex min-h-11 items-center gap-2 bg-fogon px-6 py-3 font-bold text-charcoal shadow-[0_10px_35px_rgba(246,130,62,.28)] transition hover:bg-fogon-light">
                  <Library className="size-4" /> Ir a mis canciones
                </Link>
              ) : (
                <button onClick={login} className="btn-cozy inline-flex min-h-11 items-center gap-2 bg-fogon px-6 py-3 font-bold text-charcoal shadow-[0_10px_35px_rgba(246,130,62,.28)] transition hover:bg-fogon-light">
                  <LogIn className="size-4" /> Crear mi cancionero
                </button>
              )}
              <Link href="/canciones-publicas" className="btn-cozy inline-flex min-h-11 items-center gap-2 border border-white/12 bg-white/4 px-6 py-3 font-semibold transition hover:bg-white/8" style={{ color: 'var(--text-primary)' }}>
                <Users className="size-4 text-fogon-light" /> Explorar canciones
              </Link>
            </div>
            <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>Empezá gratis: 20 canciones propias y 3 listas.</p>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="bonfire-stage relative aspect-square overflow-hidden rounded-[2.5rem] border border-fogon-light/10">
              <div className="absolute inset-x-8 bottom-0 h-24 rounded-[100%] bg-fogon/20 blur-3xl" />
              <BonfireHero className="absolute inset-0 m-auto h-[88%] w-[88%] animate-flame" />
              <div className="absolute bottom-5 left-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-bold tracking-[0.16em] text-fogon-light uppercase">Listo para tocar</p>
                <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Tu próximo set empieza acá.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/6 bg-black/10 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <p className="text-xs font-bold tracking-[0.16em] text-fogon-light uppercase">Tu música, a tu manera</p>
            <h2 className="mt-3 font-heading text-3xl tracking-tight sm:text-4xl" style={{ color: 'var(--text-primary)' }}>De una idea suelta a un repertorio listo para tocar.</h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <article key={title} className="card-cozy rounded-3xl border border-white/8 bg-white/[0.035] p-6">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-fogon/12 text-fogon-light"><Icon className="size-5" /></span>
                <h3 className="mt-5 font-heading text-xl" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.16em] text-fogon-light uppercase">Vista de canción</p>
            <h2 className="mt-3 font-heading text-3xl tracking-tight sm:text-5xl" style={{ color: 'var(--text-primary)' }}>Leé, tocá y seguí el ritmo.</h2>
            <p className="mt-4 text-base leading-7" style={{ color: 'var(--text-secondary)' }}>Una réplica de la pantalla donde podés alternar entre letra y acordes mientras tocás.</p>
          </div>

          <article className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-[0_24px_70px_rgba(0,0,0,.18)]">
            <div className="flex items-start gap-4 border-b border-white/8 p-5 sm:p-7">
              <CozyCover seed="Seminare-Seru Giran" genre="rock" size={72} className="rounded-2xl shadow-lg" />
              <div className="min-w-0 flex-1"><h3 className="truncate font-heading text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>Seminare</h3><p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Serú Girán</p><span className="mt-3 inline-flex rounded-full bg-fogon/12 px-2.5 py-1 text-[11px] font-semibold text-fogon-light">Rock nacional</span></div>
            </div>
            <div className="flex items-center border-b border-white/8 px-4 sm:px-6">
              {(['lyrics', 'chords'] as const).map((tab) => <button key={tab} type="button" onClick={() => setReaderTab(tab)} className={`min-h-12 border-b-2 px-4 text-sm font-semibold transition ${readerTab === tab ? 'border-fogon text-fogon-light' : 'border-transparent'}`} style={{ color: readerTab === tab ? undefined : 'var(--text-secondary)' }}>{tab === 'lyrics' ? 'Letra' : 'Acordes'}</button>)}
              <div className="ml-auto flex items-center gap-1"><button type="button" aria-label="Vista vertical" className="rounded-lg bg-fogon/15 p-2 text-fogon-light"><List className="size-4" /></button><button type="button" aria-label="Vista horizontal" className="rounded-lg p-2" style={{ color: 'var(--text-secondary)' }}><Columns3 className="size-4" /></button></div>
            </div>
            <div className="min-h-72 p-5 sm:p-8">
              {readerTab === 'lyrics' ? (
                <div className="space-y-2 text-[15px] leading-7" style={{ color: 'var(--text-primary)' }}>
                  <p className="rounded-lg bg-white/[0.025] px-3 py-1.5">La letra de tu canción se lee cómoda, línea por línea.</p>
                  <p className="rounded-lg px-3 py-1.5">Guardá tu versión y ajustala para cada ensayo.</p>
                  <p className="rounded-lg bg-white/[0.025] px-3 py-1.5">La vista sigue limpia para no perder el momento.</p>
                </div>
              ) : (
                <div className="space-y-4 font-mono text-[15px] leading-7"><div><p className="font-bold text-fogon-light">Am              F</p><p style={{ color: 'var(--text-primary)' }}>Los acordes se muestran con aire y claridad.</p></div><div><p className="font-bold text-fogon-light">C               G</p><p style={{ color: 'var(--text-primary)' }}>Una columna fácil de seguir mientras tocás.</p></div><div><p className="font-bold text-fogon-light">Dm              Am</p><p style={{ color: 'var(--text-primary)' }}>Tu repertorio queda listo para el próximo fogón.</p></div></div>
              )}
            </div>
          </article>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.16em] text-fogon-light uppercase">Probalo ahora</p>
            <h2 className="mt-3 font-heading text-3xl tracking-tight sm:text-5xl" style={{ color: 'var(--text-primary)' }}>Buscá una canción y llevála a tu cancionero.</h2>
            <p className="mt-4 text-base leading-7" style={{ color: 'var(--text-secondary)' }}>Elegí letra, acordes o ambos. Revisá el resultado y guardalo como una canción propia sin salir de la página.</p>
          </div>
          <div className="mx-auto mt-10 max-w-4xl"><SongSearchInputs onSongFound={selectSong} /></div>
          {!userId && <p className="mx-auto mt-4 max-w-4xl text-center text-sm" style={{ color: 'var(--text-muted)' }}>Podés buscar sin cuenta. Para guardar una canción, iniciá sesión cuando elijas un resultado.</p>}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-28" id="planes">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.16em] text-fogon-light uppercase">Hecho para crecer con vos</p>
            <h2 className="mt-3 font-heading text-3xl tracking-tight sm:text-5xl" style={{ color: 'var(--text-primary)' }}>Tu música no debería tener límites.</h2>
            <p className="mt-4 text-base leading-7" style={{ color: 'var(--text-secondary)' }}>Empezá sin costo. Cuando el repertorio pida más espacio, pasate a Escenario.</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
            {PLANS.map((plan) => (
              <article key={plan.name} className={`relative rounded-[2rem] border p-7 sm:p-8 ${plan.featured ? 'border-fogon/60 bg-gradient-to-b from-fogon/14 to-fogon/5 shadow-[0_18px_70px_rgba(246,130,62,.16)]' : 'border-white/10 bg-white/[0.025]'}`}>
                {plan.featured && <span className="absolute -top-3 left-7 rounded-full bg-fogon px-3 py-1 text-[11px] font-extrabold tracking-wide text-charcoal">PARA CRECER</span>}
                <p className="font-heading text-2xl" style={{ color: 'var(--text-primary)' }}>{plan.name}</p>
                <p className="mt-2 text-3xl font-bold text-fogon-light">{plan.price}</p>
                <p className="mt-3 min-h-12 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{plan.description}</p>
                <ul className="mt-6 space-y-3">
                  {plan.items.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-primary)' }}><Check className="mt-0.5 size-4 shrink-0 text-fogon-light" />{item}</li>)}
                </ul>
                {userId ? <Link href="/mis-canciones" className={`btn-cozy mt-8 flex min-h-11 items-center justify-center px-5 py-3 text-sm font-bold ${plan.featured ? 'bg-fogon text-charcoal hover:bg-fogon-light' : 'border border-white/15 hover:bg-white/8'}`} style={plan.featured ? undefined : { color: 'var(--text-primary)' }}>Empezar ahora</Link> : <button onClick={login} className={`btn-cozy mt-8 flex min-h-11 w-full items-center justify-center px-5 py-3 text-sm font-bold ${plan.featured ? 'bg-fogon text-charcoal hover:bg-fogon-light' : 'border border-white/15 hover:bg-white/8'}`} style={plan.featured ? undefined : { color: 'var(--text-primary)' }}>Empezar ahora</button>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/6 px-4 py-8 sm:px-6">
        <p className="mx-auto max-w-6xl text-center text-sm" style={{ color: 'var(--text-muted)' }}>fogon.app, un lugar para las canciones que te acompañan.</p>
      </footer>

      {userId && (
        <Modal isOpen={showNewSongModal} onClose={() => { setShowNewSongModal(false); setNewSongData(null); }}>
          <div className="p-4 sm:p-6">
            <h2 className="mb-6 text-xl font-bold text-warm-tan">Guardar en mi cancionero</h2>
            <NewSongForm
              userId={userId}
              initialData={newSongData ?? undefined}
              onClose={() => { setShowNewSongModal(false); setNewSongData(null); }}
              onSuccess={() => { setShowNewSongModal(false); setNewSongData(null); }}
            />
          </div>
        </Modal>
      )}
    </main>
  );
}
