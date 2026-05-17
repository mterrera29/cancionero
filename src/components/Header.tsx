'use client';

import { useState, useEffect, useRef } from 'react';
import { Music, ListMusic, Plus, LogIn, LogOut, User as UserIcon } from 'lucide-react';
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
    <header className="sticky top-0 z-40" style={{ background: 'var(--header-bg)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between relative">
        <div className="flex items-center">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col items-center justify-center w-10 h-10 gap-1 rounded-lg hover:bg-purple/20 transition-colors"
            >
              <span className={`w-5 h-0.5 rounded-full transition-all ${isMenuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} style={{ background: 'var(--text-primary)' }} />
              <span className={`w-5 h-0.5 rounded-full transition-all ${isMenuOpen ? 'opacity-0' : ''}`} style={{ background: 'var(--text-primary)' }} />
              <span className={`w-5 h-0.5 rounded-full transition-all ${isMenuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} style={{ background: 'var(--text-primary)' }} />
            </button>

            {isMenuOpen && (
              <div className="absolute top-full left-0 mt-2 min-w-[200px] py-2 rounded-xl shadow-2xl animate-fade-in overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => { router.push('/'); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-purple/20 transition-colors text-left"
                >
                  <Music className="w-5 h-5 text-purple-pastel" />
                  <span style={{ color: 'var(--text-primary)' }} className="font-medium">Mis Canciones</span>
                </button>
                <button
                  onClick={() => { router.push('/lists'); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-purple/20 transition-colors text-left"
                >
                  <ListMusic className="w-5 h-5 text-purple-pastel" />
                  <span style={{ color: 'var(--text-primary)' }} className="font-medium">Mis Listas</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <h1
          className="text-xl font-bold cursor-pointer select-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
          style={{ color: 'var(--text-primary)' }}
          onClick={() => router.push('/')}
        >
          🔥 Cancionero 🎸
        </h1>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-purple-dark/40 border border-purple/20">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <UserIcon className="w-4 h-4 text-purple-pastel" />
                )}
                <span className="text-xs text-white/60 hidden sm:block max-w-20 truncate">{user.displayName || user.email}</span>
              </div>
              <button onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-purple hover:bg-purple-light text-white font-medium px-5 py-2.5 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                Nueva
              </button>
              <button onClick={logout} className="p-2.5 rounded-xl hover:bg-purple/20 transition-colors" title="Cerrar sesión">
                <LogOut className="w-4 h-4 text-white/60" />
              </button>
            </>
          ) : (
            <button onClick={login}
              className="flex items-center gap-2 bg-purple hover:bg-purple-light text-white font-medium px-5 py-2.5 rounded-xl transition-all"
            >
              <LogIn className="w-4 h-4" />
              Ingresar
            </button>
          )}
        </div>
      </div>

      {userId && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="p-6">
            <h2 className="text-lg font-bold text-purple-pastel mb-6">Nueva Canción</h2>
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