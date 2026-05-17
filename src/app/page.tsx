'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Play, Plus, MoreHorizontal, Edit3, Trash2, Music, LogIn } from 'lucide-react';
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
    <main className="min-h-screen pb-20" style={{ background: 'var(--bg-primary)' }}>
      <Header onSongAdded={loadSongs} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Sección de bienvenida (sin login) */}
        {!userId && !loading && (
          <div className="text-center py-16 rounded-3xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-2xl" style={{ background: 'var(--bg-secondary)' }}>
              <Music className="w-10 h-10" style={{ color: 'var(--text-purple)' }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Cancionero</h1>
            <p className="text-base mb-8 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>Organizá tus letras y acordes, y buscá canciones nuevas.</p>
            <button
              onClick={login}
              className="inline-flex items-center gap-2 bg-purple hover:bg-purple-light text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <LogIn className="w-5 h-5" /> Ingresar con Google
            </button>
          </div>
        )}

        {/* Sección principal (con login) */}
        {userId && (
          <div className="space-y-6">
            {/* Componente de búsqueda */}
            <SongSearchInputs onSongFound={(data) => {
              if (!userId) { login(); return; }
              setNewSongData(data);
              setShowNewSongModal(true);
            }} />

            {/* Tabs de navegación */}
            <div className="flex gap-2 justify-center overflow-x-auto">
              {(['all', 'artists', 'genres'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setArtist(''); setGenre(''); }}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    tab === t ? 'bg-purple text-white shadow-sm' : 'hover:bg-purple/10'
                  }`}
                  style={{ color: tab === t ? '#fff' : 'var(--text-secondary)' }}
                >
                  {{ all: 'Todas', artists: 'Artistas', genres: 'Géneros' }[t]}
                </button>
              ))}
            </div>

            {/* Búsqueda y orden (mobile-first) */}
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar canción o artista..."
                  className="w-full rounded-xl pl-12 pr-4 py-3 sm:py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-purple/50 transition-all"
                  style={{ 
                    background: 'var(--input-bg)', 
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <button
                onClick={() => setSort(s => s === 'asc' ? 'desc' : 'asc')}
                className="px-5 py-3 sm:py-3.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 justify-center"
                style={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
              >
                {sort === 'asc' ? 'A-Z' : 'Z-A'}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>

            {/* Contenido según tab */}
            {loading ? (
              <div className="text-center py-16">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Tab: Artistas */}
                {tab === 'artists' && !artist && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-fade-in">
                    {artists.map(a => (
                      <button
                        key={a}
                        onClick={() => setArtist(a)}
                        className="p-4 rounded-xl transition-all text-left hover:shadow-md"
                        style={{ 
                          background: 'var(--bg-card)', 
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <p className="text-base font-medium truncate" style={{ color: 'var(--text-primary)' }}>{a}</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{songs.filter(s => s.artist === a).length} canciones</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Tab: Géneros */}
                {tab === 'genres' && !genre && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-fade-in">
                    {genres.map(g => (
                      <button
                        key={g}
                        onClick={() => setGenre(g)}
                        className="p-4 rounded-xl transition-all text-left hover:shadow-md"
                        style={{ 
                          background: 'var(--bg-card)', 
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <p className="text-base font-medium truncate" style={{ color: 'var(--text-primary)' }}>{g}</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{songs.filter(s => s.genre === g).length} canciones</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Tab: Todas o filtrado */}
                {((tab !== 'all' && (artist || genre)) || tab === 'all') && (
                  <div className="space-y-3">
                    {/* Filtro activo */}
                    {(artist || genre) && (
                      <div className="flex items-center justify-center gap-2 text-sm px-2 pb-2">
                        <span style={{ color: 'var(--text-secondary)' }}>Filtrando por: <span className="font-medium text-purple-pastel">{artist || genre}</span></span>
                        <button
                          onClick={() => { setArtist(''); setGenre(''); }}
                          className="text-pink-400 hover:text-pink-300 hover:underline text-sm transition-colors"
                        >
                          Limpiar
                        </button>
                      </div>
                    )}

                    {/* Resultados */}
                    {filtered.length === 0 ? (
                      <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <Music className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                        <p className="text-base" style={{ color: 'var(--text-muted)' }}>No se encontraron canciones</p>
                        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Probá con otro término o filtro</p>
                      </div>
                    ) : (
                      <div className="space-y-1 animate-fade-in">
                        {filtered.map((song, i) => (
                          <div
                            key={song.id}
                            onClick={() => router.push(`/song/${song.id}`)}
                            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative cursor-pointer hover:bg-white/5"
                            style={{ animationDelay: `${i * 20}ms` }}
                          >
                            {/* Portada o placeholder */}
                            {song.cover ? (
                              <img src={song.cover} alt="" className="w-10 h-10 rounded-md shrink-0 object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-md shrink-0 flex items-center justify-center" style={{ background: getColor(song.id) }}>
                                <Music className="w-5 h-5 text-white/70" />
                              </div>
                            )}

                            {/* Botón de play (aparece al hacer hover) */}
                            <div className="absolute left-3 w-10 h-10 rounded-md flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); router.push(`/song/${song.id}`); }}>
                              <Play className="w-4 h-4 text-white" fill="white" />
                            </div>

                            {/* Info de la canción */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate transition-colors group-hover:text-white"
                                style={{ color: 'var(--text-primary)' }}>{song.title}</p>
                              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{song.artist}</p>
                            </div>

                            {/* Género (opcional) */}
                            <span className="text-[11px] hidden sm:block" style={{ color: 'var(--text-muted)' }}>{song.genre}</span>

                            {/* Menú contextual */}
                            <div className="relative">
                              <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === song.id ? null : song.id); }}
                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                              >
                                <MoreHorizontal className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                              </button>
                              {menuOpen === song.id && (
                                <div
                                  className="absolute right-0 top-full mt-1 min-w-[160px] rounded-xl shadow-lg py-1.5 z-10 animate-fade-in"
                                  style={{ 
                                    background: 'var(--bg-secondary)', 
                                    border: '1px solid var(--border-color)',
                                  }}
                                  onMouseLeave={() => setMenuOpen(null)}
                                >
                                  <button
                                    onClick={() => { setEditSong(song); setMenuOpen(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple/10 transition-colors text-left text-sm"
                                    style={{ color: 'var(--text-primary)' }}
                                  >
                                    <Edit3 className="w-4 h-4 text-purple-pastel" /> Editar
                                  </button>
                                  <button
                                    onClick={() => { deleteSong(song.id); setMenuOpen(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-left text-sm text-red-400/90"
                                  >
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      {userId && (
        <Modal isOpen={!!editSong} onClose={() => setEditSong(null)}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-purple-pastel mb-6">Editar Canción</h2>
            <NewSongForm userId={userId} onClose={() => setEditSong(null)} onSuccess={() => { setEditSong(null); loadSongs(); }} editSong={editSong!} />
          </div>
        </Modal>
      )}

      {/* Botón flotante para Nueva Canción (mobile) */}
      {userId && (
        <button
          onClick={() => setShowNewSongModal(true)}
          className="fixed bottom-6 right-6 z-30 sm:hidden flex items-center justify-center w-14 h-14 rounded-full bg-purple hover:bg-purple-light text-white shadow-lg transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modales */}
      {userId && (
        <Modal isOpen={showNewSongModal} onClose={() => { setShowNewSongModal(false); setNewSongData(null); }}>
          <div className="p-4 sm:p-6">
            <h2 className="text-xl font-bold text-purple-pastel mb-6">Nueva Canción</h2>
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
