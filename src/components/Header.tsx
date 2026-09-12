'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Flame, Music, ListMusic, Plus, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import NewSongForm from './NewSongForm';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onSongAdded?: () => void;
}

export default function Header({ onSongAdded }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, userId, login, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full" style={{ background: 'var(--header-bg)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between relative w-full">
        {/* Menú hamburguesa (izquierda) */}
        <div className="flex items-center">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col items-center justify-center w-10 h-10 gap-1.5 rounded-lg hover:bg-terracotta/20 transition-colors p-2"
            >
              <span className={`w-6 h-0.5 rounded-full transition-all ${isMenuOpen ? 'rotate-45 translate-y-[4px]' : ''}`} style={{ background: 'var(--text-primary)' }} />
              <span className={`w-6 h-0.5 rounded-full transition-all ${isMenuOpen ? 'opacity-0' : ''}`} style={{ background: 'var(--text-primary)' }} />
              <span className={`w-6 h-0.5 rounded-full transition-all ${isMenuOpen ? '-rotate-45 -translate-y-[4px]' : ''}`} style={{ background: 'var(--text-primary)' }} />
            </button>

            {/* Menú lateral (mobile-first) */}
            {isMenuOpen && (
              <div className="fixed inset-0 z-40 flex">
                {/* Overlay */}
                <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)}></div>

                {/* Menú lateral */}
                 <div className="relative w-64 h-full animate-slide-in" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)' }}>
                   <div className="p-4 border-b border-terracotta/20">
                       <h2 className="flex items-center gap-2 text-xl font-heading" style={{ color: 'var(--text-primary)' }}><Flame className="size-4 text-fogon-light" /> fogon</h2>
                   </div>
                   <div className="p-4 space-y-1">
                      <button
                        onClick={() => { router.push('/mis-canciones'); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-terracotta/10 transition-colors text-left"
                      >
                        <Music className="w-5 h-5 text-warm-tan" />
                        <span style={{ color: 'var(--text-primary)' }} className="font-medium">Mis Canciones</span>
                      </button>
                      <button
                        onClick={() => { router.push('/canciones-publicas'); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-terracotta/10 transition-colors text-left"
                      >
                        <Music className="w-5 h-5 text-warm-tan" />
                        <span style={{ color: 'var(--text-primary)' }} className="font-medium">Canciones Públicas</span>
                      </button>
                      <button
                        onClick={() => { router.push('/lists'); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-terracotta/10 transition-colors text-left"
                      >
                        <ListMusic className="w-5 h-5 text-warm-tan" />
                        <span style={{ color: 'var(--text-primary)' }} className="font-medium">Mis Listas</span>
                      </button>

                      {/* Separador */}
                      {userId && <div className="pt-2 pb-1"><div className="h-px" style={{ background: 'var(--border-color)' }}></div></div>}

                      {/* Botón Nueva Canción (en el menú) */}
                     {userId && (
                       <button
                         onClick={() => { setIsModalOpen(true); setIsMenuOpen(false); }}
                          className="btn-cozy w-full flex items-center gap-3 px-4 py-3 bg-warm-tan hover:bg-dusty-rose text-charcoal transition-colors text-left font-medium"
                       >
                         <Plus className="w-5 h-5" />
                         <span>Nueva Canción</span>
                       </button>
                     )}

                     {/* Separador */}
                     <div className="pt-2 pb-1"><div className="h-px" style={{ background: 'var(--border-color)' }}></div></div>

                     {/* Theme Toggle (en el menú) */}
                     <div className="flex items-center justify-between px-4 py-3">
                       <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Tema oscuro</span>
                       <ThemeToggle />
                     </div>
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Logo (centrado) */}
        <div className="flex items-center gap-2">
          <h1
            className="flex items-center gap-2 text-2xl font-heading cursor-pointer select-none whitespace-nowrap"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => router.push('/')}
          >
            <Flame className="size-5 text-fogon-light" /> fogon
          </h1>
        </div>

        {/* Usuario y acciones (derecha) */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Usuario y cerrar sesión */}
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors">
                {user.photoURL ? (
                  <Image src={user.photoURL} alt="" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-terracotta/30" />
                ) : (
                  <UserIcon className="w-6 h-6 text-warm-tan" />
                )}
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg hover:bg-terracotta/20 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={login}
              className="btn-cozy flex items-center gap-2 bg-warm-tan hover:bg-dusty-rose text-charcoal font-medium px-5 py-2.5 transition-all shadow-sm hover:shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:block">Ingresar</span>
            </button>
          )}
        </div>
      </div>

      {userId && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="p-6">
            <h2 className="text-lg font-bold text-warm-tan mb-6">Nueva Canción</h2>
            <NewSongForm
              userId={userId}
              onClose={() => setIsModalOpen(false)}
              onSuccess={onSongAdded}
            />
          </div>
        </Modal>
      )}
    </header>
  );
}
