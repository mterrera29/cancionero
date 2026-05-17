'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Play, MoreHorizontal, Edit3, Trash2, Music, LogIn } from 'lucide-react';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import NewSongForm from '@/components/NewSongForm';
import SongSearchInputs from '@/components/SongSearchInputs';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/hooks/useAuth';
const COLORS = ['#5c3e91', '#7c3aed', '#a855f7', '#8b5cf6', '#6d28d9', '#4c1d95', '#3b0764', '#701a75'];

function getColor(id: string) {
  return COLORS[parseInt(id) % COLORS.length];
}

export default function Home() {
  const router = useRouter();
  const { userId, login } = useAuth();
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [genre, setGenre] = useState('');
  const [artist, setArtist] = useState('');
  const [tab, setTab] = useState<'all' | 'artists' | 'genres'>('all');
  const [editSong, setEditSong] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [newSongData, setNewSongData] = useState<{ title: string; artist: string; lyrics: string } | null>(null);
  const [showNewSongModal, setShowNewSongModal] = useState(false);

  const loadSongs = useCallback(async () => {
    if (!userId) return;
    try {
      const r = await fetch(`/api/songs/${userId}`);
      if (r.ok) setSongs(await r.json());
    } catch {} finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { loadSongs(); }, [loadSongs]);

  async function deleteSong(id: string) {
    if (!userId) return;
    await fetch(`/api/songs/${userId}/${id}`, { method: 'DELETE' });
    setSongs(prev => prev.filter(s => s.id !== id));
  }

  const filtered = songs
    .filter(s => {
      const q = search.toLowerCase();
      return (!search || s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
        && (!genre || s.genre === genre)
        && (!artist || s.artist.toLowerCase() === artist.toLowerCase());
    })
    .sort((a, b) => sort === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));

  const artists = [...new Set(songs.map(s => s.artist))].sort();
  const genres = [...new Set(songs.map(s => s.genre))].sort();

  return (
    <main className="min-h-screen pb-16" style={{ background: 'var(--bg-primary)' }}>
      <Header onSongAdded={loadSongs} />

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
        {!userId && !loading && (
          <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <Music className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Cancionero</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Ingresá con Google para ver y crear tus canciones</p>
            <button onClick={login} className="inline-flex items-center gap-2 bg-purple hover:bg-purple-light text-white font-medium px-6 py-3 rounded-xl transition-all">
              <LogIn className="w-4 h-4" /> Ingresar con Google
            </button>
          </div>
        )}

        {userId && (
          <>
        <SongSearchInputs onSongFound={(data) => {
          if (!userId) { login(); return; }
          setNewSongData(data);
          setShowNewSongModal(true);
        }} />

        <div className="flex gap-2">
          {(['all', 'artists', 'genres'] as const).map(t => (
            <button key={t}
              onClick={() => { setTab(t); setArtist(''); setGenre(''); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                tab === t ? 'bg-purple text-white' : 'hover:bg-purple/20'
              }`}
              style={{ color: tab === t ? '#fff' : 'var(--text-secondary)' }}
            >
              {{ all: 'Todas', artists: 'Artistas', genres: 'Géneros' }[t]}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar canción o artista..."
              className="w-full rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple/50 transition-colors"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>
          <button onClick={() => setSort(s => s === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2.5 rounded-full text-sm transition-all"
            style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
          >
            {sort === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
        </div>

        {loading ? <Spinner /> : (
          <>
        {tab === 'artists' && !artist && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {artists.map(a => (
              <button key={a} onClick={() => setArtist(a)}
                className="p-4 rounded-xl transition-all text-left"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{a}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{songs.filter(s => s.artist === a).length} canciones</p>
              </button>
            ))}
          </div>
        )}

        {tab === 'genres' && !genre && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {genres.map(g => (
              <button key={g} onClick={() => setGenre(g)}
                className="p-4 rounded-xl transition-all text-left"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{g}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{songs.filter(s => s.genre === g).length} canciones</p>
              </button>
            ))}
          </div>
        )}

        {((tab !== 'all' && (artist || genre)) || tab === 'all') && (
          <div className="space-y-1">
            {(artist || genre) && (
              <div className="flex items-center gap-2 text-sm px-1 pb-2" style={{ color: 'var(--text-secondary)' }}>
                <span>Filtrando: <span className="text-purple-pastel">{artist || genre}</span></span>
                <button onClick={() => { setArtist(''); setGenre(''); }} className="text-pink-soft/70 hover:text-pink-soft hover:underline text-xs">Limpiar</button>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Music className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-muted)' }} className="text-sm">No se encontraron canciones</p>
              </div>
            ) : (
              <div>
                {filtered.map((song, i) => (
                  <div key={song.id} onClick={() => router.push(`/song/${song.id}`)}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative cursor-pointer"
                    style={{ animationDelay: `${i * 20}ms` }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {song.cover ? (
                      <img src={song.cover} alt="" className="w-10 h-10 rounded-md shrink-0 object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-md shrink-0 flex items-center justify-center" style={{ background: getColor(song.id) }}>
                        <Music className="w-5 h-5 text-white/70" />
                      </div>
                    )}

                    <div className="absolute left-3 w-10 h-10 rounded-md flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); router.push(`/song/${song.id}`); }}>
                      <Play className="w-4 h-4 text-white" fill="white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate transition-colors group-hover:text-white"
                        style={{ color: 'var(--text-primary)' }}>{song.title}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{song.artist}</p>
                    </div>

                    <span className="text-[11px] hidden sm:block" style={{ color: 'var(--text-muted)' }}>{song.genre}</span>

                    <div className="relative">
                      <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === song.id ? null : song.id); }}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all">
                        <MoreHorizontal className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      </button>
                      {menuOpen === song.id && (
                        <div className="absolute right-0 top-full mt-1 min-w-[160px] rounded-xl shadow-2xl py-1.5 z-10 animate-fade-in"
                          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                          onMouseLeave={() => setMenuOpen(null)}>
                          <button onClick={() => { setEditSong(song); setMenuOpen(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple/20 transition-colors text-left text-sm"
                            style={{ color: 'var(--text-primary)' }}>
                            <Edit3 className="w-4 h-4 text-purple-pastel" /> Editar
                          </button>
                          <button onClick={() => { deleteSong(song.id); setMenuOpen(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-left text-sm text-red-400/70">
                            <Trash2 className="w-4 h-4 text-red-400" /> Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
          </>
        )}
          </>
        )}
      </div>

      {userId && (
        <Modal isOpen={!!editSong} onClose={() => setEditSong(null)}>
          <div className="p-6">
            <h2 className="text-lg font-bold text-purple-pastel mb-6">Editar Canción</h2>
            <NewSongForm userId={userId} onClose={() => setEditSong(null)} onSuccess={() => { setEditSong(null); loadSongs(); }} editSong={editSong!} />
          </div>
        </Modal>
      )}

      {userId && (
        <Modal isOpen={showNewSongModal} onClose={() => { setShowNewSongModal(false); setNewSongData(null); }}>
          <div className="p-6">
            <h2 className="text-lg font-bold text-purple-pastel mb-6">Nueva Canción</h2>
            <NewSongForm
              userId={userId}
              onClose={() => { setShowNewSongModal(false); setNewSongData(null); }}
              onSuccess={() => { setShowNewSongModal(false); loadSongs(); }}
              initialData={newSongData ?? undefined}
            />
          </div>
        </Modal>
      )}
    </main>
  );
}
