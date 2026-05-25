'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Play, Plus, MoreHorizontal, Edit3, Trash2, Music, LogIn, Globe, Lock, ListMusic } from 'lucide-react';
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

const LISTS_PER_PAGE = 5;

export default function MisCancionesPage() {
  const router = useRouter();
  const { userId, login, getToken } = useAuth();
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [genre, setGenre] = useState('');
  const [artist, setArtist] = useState('');
  const [tab, setTab] = useState<'all' | 'artists' | 'genres'>('all');
  const [editSong, setEditSong] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [newSongData, setNewSongData] = useState<{ title: string; artist: string; lyrics?: string; chords?: string } | null>(null);
  const [showNewSongModal, setShowNewSongModal] = useState(false);

  // Add to list state
  const [showListModal, setShowListModal] = useState(false);
  const [lists, setLists] = useState<any[]>([]);
  const [listsPage, setListsPage] = useState(0);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [listsLoading, setListsLoading] = useState(false);

  const loadSongs = useCallback(async () => {
    if (!userId) return;
    try {
      const token = await getToken();
      const r = await fetch(`/api/songs/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (r.ok) setSongs(await r.json());
    } catch {} finally { setLoading(false); }
  }, [userId, getToken]);

  useEffect(() => { loadSongs(); }, [loadSongs]);

  async function deleteSong(id: string) {
    if (!userId) return;
    const token = await getToken();
    await fetch(`/api/songs/${userId}/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    setSongs(prev => prev.filter(s => s.id !== id));
  }

  async function togglePublic(song: any) {
    if (!userId) return;
    const token = await getToken();
    const r = await fetch(`/api/songs/${userId}/${song.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ isPublic: !song.isPublic }),
    });
    if (r.ok) {
      const updated = await r.json();
      setSongs(prev => prev.map(s => s.id === updated.id ? updated : s));
    }
    setMenuOpen(null);
  }

  async function openListModal(songId: string) {
    setSelectedSongId(songId);
    setListsPage(0);
    setListsLoading(true);
    setShowListModal(true);
    setMenuOpen(null);
    try {
      const token = await getToken();
      const r = await fetch(`/api/lists/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (r.ok) setLists(await r.json());
    } catch {} finally { setListsLoading(false); }
  }

  async function addToList(listId: string) {
    if (!userId || !selectedSongId) return;
    const token = await getToken();
    await fetch(`/api/lists/${userId}/${listId}/songs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ songId: selectedSongId }),
    });
    setShowListModal(false);
    setSelectedSongId(null);
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

  const paginatedLists = lists.slice(listsPage * LISTS_PER_PAGE, (listsPage + 1) * LISTS_PER_PAGE);
  const totalListPages = Math.ceil(lists.length / LISTS_PER_PAGE);

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
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Mis Canciones</h1>
            <p className="text-base mb-8 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>Iniciá sesión para ver y gestionar tus canciones.</p>
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
            <SongSearchInputs onSongFound={(data) => {
              if (!userId) { login(); return; }
              setNewSongData(data);
              setShowNewSongModal(true);
            }} />

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

            {loading ? (
              <div className="text-center py-16">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="space-y-4">
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

                {((tab !== 'all' && (artist || genre)) || tab === 'all') && (
                  <div className="space-y-3">
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

                            {/* Icono público/privado */}
                            <button
                              onClick={(e) => { e.stopPropagation(); togglePublic(song); }}
                              className="p-1 rounded-lg hover:bg-purple/20 transition-colors shrink-0"
                              title={song.isPublic ? 'Hacer privada' : 'Hacer pública'}
                            >
                              {song.isPublic ? (
                                <Globe className="w-3.5 h-3.5 text-purple-pastel" />
                              ) : (
                                <Lock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                              )}
                            </button>

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
                                  className="absolute right-0 top-full mt-1 min-w-[180px] rounded-xl shadow-lg py-1.5 z-10 animate-fade-in"
                                  style={{ 
                                    background: 'var(--bg-secondary)', 
                                    border: '1px solid var(--border-color)',
                                  }}
                                  onMouseLeave={() => setMenuOpen(null)}
                                >
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setEditSong(song); setMenuOpen(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple/10 transition-colors text-left text-sm"
                                    style={{ color: 'var(--text-primary)' }}
                                  >
                                    <Edit3 className="w-4 h-4 text-purple-pastel" /> Editar
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); togglePublic(song); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple/10 transition-colors text-left text-sm"
                                    style={{ color: 'var(--text-primary)' }}
                                  >
                                    {song.isPublic ? (
                                      <Lock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                    ) : (
                                      <Globe className="w-4 h-4 text-purple-pastel" />
                                    )}
                                    {song.isPublic ? 'Hacer privada' : 'Hacer pública'}
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); openListModal(song.id); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple/10 transition-colors text-left text-sm"
                                    style={{ color: 'var(--text-primary)' }}
                                  >
                                    <ListMusic className="w-4 h-4 text-purple-pastel" /> Agregar a lista
                                  </button>
                                  <div className="h-px my-1" style={{ background: 'var(--border-color)' }} />
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteSong(song.id); setMenuOpen(null); }}
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

      {userId && (
        <Modal isOpen={!!editSong} onClose={() => setEditSong(null)}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-purple-pastel mb-6">Editar Canción</h2>
            <NewSongForm userId={userId} onClose={() => setEditSong(null)} onSuccess={() => { setEditSong(null); loadSongs(); }} editSong={editSong!} />
          </div>
        </Modal>
      )}

      {userId && (
        <button
          onClick={() => setShowNewSongModal(true)}
          className="fixed bottom-6 right-6 z-30 sm:hidden flex items-center justify-center w-14 h-14 rounded-full bg-purple hover:bg-purple-light text-white shadow-lg transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

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

      {/* Modal Agregar a lista */}
      <Modal isOpen={showListModal} onClose={() => { setShowListModal(false); setSelectedSongId(null); }}>
        <div className="p-6">
          <h2 className="text-lg font-bold text-purple-pastel mb-4">Agregar a lista</h2>
          {listsLoading ? (
            <div className="text-center py-8"><Spinner size="md" /></div>
          ) : paginatedLists.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>
              No tenés listas todavía. Creá una desde el menú lateral.
            </p>
          ) : (
            <>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {paginatedLists.map((list: any) => (
                  <button
                    key={list.id}
                    onClick={() => addToList(list.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left hover:bg-purple/10"
                    style={{ border: '1px solid var(--border-color)' }}
                  >
                    <ListMusic className="w-4 h-4 text-purple-pastel shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{list.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{list.songIds.length} canciones</p>
                    </div>
                  </button>
                ))}
              </div>

              {totalListPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setListsPage(p => Math.max(0, p - 1))}
                    disabled={listsPage === 0}
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-30 hover:bg-purple/10"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Anterior
                  </button>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {listsPage + 1} / {totalListPages}
                  </span>
                  <button
                    onClick={() => setListsPage(p => Math.min(totalListPages - 1, p + 1))}
                    disabled={listsPage >= totalListPages - 1}
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-30 hover:bg-purple/10"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </main>
  );
}
