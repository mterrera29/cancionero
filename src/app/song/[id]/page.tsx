'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Music, Edit3, Trash2 } from 'lucide-react';
import SongContentView from '@/components/SongContentView';
import SongPlayerBar from '@/components/SongPlayerBar';
import Modal from '@/components/Modal';
import NewSongForm from '@/components/NewSongForm';
import Spinner from '@/components/Spinner';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useAuth } from '@/hooks/useAuth';

export default function SongDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { userId, getToken } = useAuth();
  useWakeLock();

  const [song, setSong] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState('lyrics');
  const [fontSizeLyrics, setFontSizeLyrics] = useState(14);
  const [fontSizeChords, setFontSizeChords] = useState(14);
  const [lineHeight, setLineHeight] = useState(1);
  const [displayMode, setDisplayMode] = useState<'vertical' | 'horizontal'>('vertical');
  const [scrollSpeed, setScrollSpeed] = useState(0.3);
  const [delayTime, setDelayTime] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const horizontalScrollRef = useRef<HTMLDivElement | null>(null);

  // Cargar/recargar canción
  const loadSong = useCallback(async () => {
    setLoading(true);
    try {
      // First try: load as owner via userId route
      if (userId) {
        const token = await getToken();
        const r = await fetch(`/api/songs/${userId}/${params.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (r.ok) {
          const data = await r.json();
          setSong(data);
          setIsOwner(true);
          applySettings(data);
          return;
        }
      }

      // Second try: load as public song
      const r = await fetch(`/api/songs/public/${params.id}`);
      if (r.ok) {
        const data = await r.json();
        setSong(data);
        setIsOwner(false);
        applySettings(data);
        return;
      }

      // Not found
      setSong(null);
    } catch {
      setSong(null);
    } finally {
      setLoading(false);
    }
  }, [userId, params.id]);

  function applySettings(data: any) {
    setFontSizeLyrics(data.fontSizeLyrics ?? 14);
    setFontSizeChords(data.fontSizeChords ?? 14);
    setLineHeight(data.lineHeight ?? 1);
    setDisplayMode(data.displayMode ?? 'vertical');
    setScrollSpeed(data.scrollSpeed ?? 0.3);
    setDelayTime(data.delayTime ?? 0);
    if (!data.cover && data.title && userId) {
      fetch(`/api/spotify/search?q=${encodeURIComponent(data.title + ' ' + (data.artist || ''))}&type=track`)
        .then(r => r.json())
        .then(sp => {
          const cover = sp.tracks?.[0]?.cover;
          if (cover) {
            getToken().then(token => {
              fetch(`/api/songs/${userId}/${params.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ cover }),
              });
            });
            setSong((prev: any) => prev ? { ...prev, cover } : prev);
          }
        })
        .catch(() => {});
    }
  }

  useEffect(() => { loadSong(); }, [loadSong]);

  async function deleteSong() {
    if (!userId) return;
    const token = await getToken();
    await fetch(`/api/songs/${userId}/${params.id}`, {
      method: 'DELETE',
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    });
    router.push('/');
  }

  async function saveSettings() {
    if (!userId) return;
    const token = await getToken();
    await fetch(`/api/songs/${userId}/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        fontSizeLyrics,
        fontSizeChords,
        lineHeight,
        displayMode,
        scrollSpeed,
        delayTime,
      }),
    });
  }

  if (loading) return <Spinner />;

  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <Music className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>Canción no encontrada</p>
          <button onClick={() => router.push('/')} className="bg-purple hover:bg-purple-light text-white px-6 py-2.5 rounded-xl transition-all">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {displayMode === 'horizontal' ? (
        /* ── Modo horizontal: header mínimo + columnas full ── */
        <>
          <div
            className="flex items-center gap-2 px-4"
            style={{ height: '44px', background: 'var(--header-bg)', borderBottom: '1px solid var(--border-color)' }}
          >
            <div className="flex items-center gap-2 min-w-0 shrink-0">
              <button onClick={() => router.push('/')} className="shrink-0 p-1.5 rounded-lg hover:bg-purple/20 transition-colors">
                <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </button>
              <span className="text-sm font-medium truncate max-w-[120px] sm:max-w-none" style={{ color: 'var(--text-primary)' }}>{song.title}</span>
              <span className="text-sm hidden sm:inline" style={{ color: 'var(--text-muted)' }}>— {song.artist}</span>
            </div>

            {/* Tabs lyrics/chords */}
            <div className="flex items-center gap-1 mx-auto">
              {['lyrics', 'chords'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === tab ? 'bg-purple text-white' : 'hover:bg-purple/10'
                  }`}
                  style={{ color: activeTab === tab ? '#fff' : 'var(--text-secondary)' }}
                >
                  {{ lyrics: 'Letra', chords: 'Acordes' }[tab]}
                </button>
              ))}
            </div>

            {isOwner ? (
              <div className="flex gap-0.5 shrink-0">
                <button onClick={() => setShowEdit(true)} className="p-1.5 rounded-lg hover:bg-purple/20 transition-colors" title="Editar">
                  <Edit3 className="w-4 h-4 text-purple-pastel" />
                </button>
                <button onClick={() => setShowDelete(true)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Eliminar">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ) : song.displayName ? (
              <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                por {song.displayName}
              </span>
            ) : null}
          </div>
          <div className="w-full" style={{ height: 'calc(100vh - 44px - 72px)' }}>
            <SongContentView
              lyrics={song.lyrics}
              chords={song.chords}
              activeTab={activeTab}
              fontSize={activeTab === 'lyrics' ? fontSizeLyrics : fontSizeChords}
              lineHeight={lineHeight}
              displayMode={displayMode}
              horizontalScrollRef={horizontalScrollRef}
            />
          </div>
        </>
      ) : (
        /* ── Modo vertical: layout con header y tabs ── */
        <div className="max-w-3xl mx-auto px-6 pb-24 pt-20 animate-fade-in">
          <div className="flex items-start gap-5 mb-8">
            <button onClick={() => router.push('/')} className="shrink-0 mt-1 p-1.5 rounded-lg hover:bg-purple/20 transition-colors">
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
            {song.cover ? (
              <img src={song.cover} alt="" className="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple to-purple-light flex items-center justify-center shrink-0 shadow-lg">
                <Music className="w-8 h-8 text-white/60" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold mb-1 truncate" style={{ color: 'var(--text-primary)' }}>{song.title}</h1>
                  <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{song.artist}</p>
                  {!isOwner && song.displayName && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      por {song.displayName}
                    </p>
                  )}
                </div>
                {isOwner && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setShowEdit(true)} className="p-2 rounded-xl hover:bg-purple/20 transition-colors" title="Editar">
                      <Edit3 className="w-4 h-4 text-purple-pastel" />
                    </button>
                    <button onClick={() => setShowDelete(true)} className="p-2 rounded-xl hover:bg-red-500/10 transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                )}
              </div>
              <span className="inline-block mt-2 text-[11px] px-2.5 py-1 rounded-full" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>{song.genre}</span>
            </div>
          </div>

          <div className="flex mb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
            {['lyrics', 'chords'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-[1px] ${
                  activeTab === tab
                    ? 'text-purple-pastel border-purple-pastel'
                    : 'border-transparent'
                }`}
                style={{ color: activeTab === tab ? undefined : 'var(--text-secondary)' }}
              >
                {{ lyrics: 'Letra', chords: 'Acordes' }[tab]}
              </button>
            ))}
          </div>

          <SongContentView
            lyrics={song.lyrics}
            chords={song.chords}
            activeTab={activeTab}
            fontSize={activeTab === 'lyrics' ? fontSizeLyrics : fontSizeChords}
            lineHeight={lineHeight}
            displayMode={displayMode}
          />
        </div>
      )}

      <SongPlayerBar
        fontSizeLyrics={fontSizeLyrics}
        fontSizeChords={fontSizeChords}
        setFontSizeLyrics={setFontSizeLyrics}
        setFontSizeChords={setFontSizeChords}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        scrollSpeed={scrollSpeed}
        setScrollSpeed={setScrollSpeed}
        delayTime={delayTime}
        setDelayTime={setDelayTime}
        activeTab={activeTab}
        onSave={saveSettings}
        horizontalScrollRef={horizontalScrollRef}
      />

      {userId && (
        <Modal isOpen={showEdit} onClose={() => setShowEdit(false)}>
          <div className="p-6">
            <h2 className="text-lg font-bold text-purple-pastel mb-6">Editar Canción</h2>
            <NewSongForm
              userId={userId}
              onClose={() => setShowEdit(false)}
              onSuccess={() => { loadSong(); setShowEdit(false); }}
              editSong={song}
            />
          </div>
        </Modal>
      )}

      {isOwner && (
        <Modal isOpen={showDelete} onClose={() => setShowDelete(false)}>
          <div className="p-6">
            <h2 className="text-lg font-bold text-purple-pastel mb-3">Eliminar canción</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              ¿Estás seguro de que querés eliminar <span className="text-purple-pastel font-medium">{song.title}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={deleteSong}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-3 rounded-xl transition-all"
              >
                Eliminar
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="px-6 py-3 rounded-xl transition-colors"
                style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
