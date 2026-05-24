'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Music, LogIn, ArrowLeft } from 'lucide-react';
import SongCard from '@/components/SongCard';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/hooks/useAuth';
import type { Song } from '@/types';

export default function PublicSongsPage() {
  const router = useRouter();
  const { userId, login, loading: authLoading } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadSongs = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const url = q
        ? `/api/songs/public?q=${encodeURIComponent(q)}`
        : '/api/songs/public';
      const r = await fetch(url);
      if (r.ok) {
        const data = await r.json();
        setSongs(data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSongs(search || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, loadSongs]);

  return (
    <main className="min-h-screen pb-20" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 flex items-center gap-3 px-4 sm:px-6 h-16"
        style={{ background: 'var(--header-bg)', borderBottom: '1px solid var(--border-color)' }}
      >
        <button
          onClick={() => router.push('/')}
          className="p-1.5 rounded-lg hover:bg-purple/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          Canciones Públicas
        </h1>
        <div className="flex-1" />

        {/* Auth state in header */}
        {!authLoading && !userId && (
          <button
            onClick={login}
            className="flex items-center gap-2 bg-purple hover:bg-purple-light text-white font-medium px-4 py-2 rounded-xl transition-all text-sm"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:block">Ingresar</span>
          </button>
        )}
        {userId && (
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 bg-purple/20 hover:bg-purple/30 text-purple-pastel font-medium px-4 py-2 rounded-xl transition-all text-sm"
          >
            <Music className="w-4 h-4" />
            <span className="hidden sm:block">Mis Canciones</span>
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar canciones públicas por título o artista..."
            className="w-full rounded-xl pl-12 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple/50 transition-all"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16">
            <Spinner size="lg" />
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <Music className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p className="text-base" style={{ color: 'var(--text-muted)' }}>
              {search ? 'No se encontraron canciones públicas' : 'Aún no hay canciones públicas'}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              {search
                ? 'Probá con otro término de búsqueda'
                : 'Los usuarios pueden hacer públicas sus canciones desde el editor'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {songs.length} {songs.length === 1 ? 'canción pública' : 'canciones públicas'}
            </p>
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                userId={userId || ''}
                onDelete={() => {}}
                onEdit={() => {}}
                showAuthor
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
