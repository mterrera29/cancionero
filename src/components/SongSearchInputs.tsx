'use client';

import { useState } from 'react';
import { Link, Search, Check, Music, RefreshCw } from 'lucide-react';
import Spinner from './Spinner';

interface SongSearchInputsProps {
  onSongFound: (data: { title: string; artist: string; lyrics?: string; chords?: string; cover?: string }) => void;
}

interface Candidate {
  title: string;
  artist: string;
}

type SearchMode = 'lyrics' | 'chords' | 'combined';

interface CombinedResult {
  lyrics: { text: string; source: Candidate } | null
  chords: { text: string; source: Candidate } | null
}

export default function SongSearchInputs({ onSongFound }: SongSearchInputsProps) {
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchArtist, setSearchArtist] = useState('');
  const [searching, setSearching] = useState(false);
  const [fetchingLyrics, setFetchingLyrics] = useState(false);
  const [searchMsg, setSearchMsg] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [trySource, setTrySource] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('lyrics');
  const [combined, setCombined] = useState<CombinedResult | null>(null);
  const [fetchingTarget, setFetchingTarget] = useState<'lyrics' | 'chords' | null>(null);

  function norm(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function cleanSearchTitle(title: string): string {
    return title.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
  }

  async function doSearch(source?: number) {
    if (!searchTitle.trim()) return;
    const songTitle = searchTitle.trim();
    const songArtist = searchArtist.trim();
    const src = source ?? trySource;

    setSearching(true);
    setSearchMsg('Buscando...');
    setCombined(null);
    if (source === undefined) setCandidates([]);
    try {
      const res = await fetch('/api/google-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: songTitle, mode: 'search', try_source: src }),
      });
      const data = await res.json();
      setTrySource(src);
      setHasMore(data.hasMore ?? false);
      if (data.candidates?.length > 0) {
        let filtered: Candidate[] = data.candidates;
        if (songArtist) {
          const na = norm(songArtist);
          filtered = filtered.filter(c => norm(c.artist).includes(na));
        }
        const searchWords = norm(songTitle).split(/\s+/).filter(Boolean);
        if (searchWords.length > 0) {
          filtered = filtered.filter(c => {
            const ct = norm(c.title);
            return searchWords.some(w => ct.includes(w));
          });
        }
        if (filtered.length > 0) {
          setCandidates(filtered);
          setSearchMsg(filtered.length === 1
            ? '✅ 1 resultado encontrado'
            : `✅ ${filtered.length} resultados encontrados`);
          setTimeout(() => setSearchMsg(''), 3000);

          if (filtered.length === 1 && searchMode !== 'combined') {
            selectCandidate(filtered[0]);
          }
        } else {
          setSearchMsg('❌ No se encontraron resultados');
          setTimeout(() => setSearchMsg(''), 3000);
        }
      } else if (!hasMore) {
        setSearchMsg('❌ No se encontraron resultados');
        setTimeout(() => setSearchMsg(''), 3000);
      } else {
        setSearchMsg('😕 Sin resultados en esta fuente');
        setTimeout(() => setSearchMsg(''), 3000);
      }
    } catch (e) {
      setSearchMsg('❌ Error al buscar');
      console.error(e);
    }
    setSearching(false);
  }

  async function fetchSpotifyCover(title: string, artist: string): Promise<string | undefined> {
    try {
      const query = `${title} ${artist}`;
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&type=track`);
      const data = await res.json();
      return data.tracks?.[0]?.cover || undefined;
    } catch {
      return undefined;
    }
  }

  async function fetchOne(c: Candidate, mode: 'lyrics' | 'chords'): Promise<string | null> {
    try {
      const cleanTitle = cleanSearchTitle(c.title);
      const query = `${cleanTitle} - ${c.artist}`;
      const res = await fetch('/api/google-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: cleanTitle, artist: c.artist, query, search_mode: mode }),
      });
      const data = await res.json();
      return data[mode] || null;
    } catch { return null; }
  }

  async function selectCandidate(first: Candidate) {
    setFetchingLyrics(true);

    if (searchMode === 'combined') {
      setCombined(null);
      setSearchMsg(`Buscando letra y acordes: ${first.title} - ${first.artist}...`);

      const [lyricsText, chordsText] = await Promise.all([
        fetchOne(first, 'lyrics'),
        fetchOne(first, 'chords'),
      ]);

      setCombined({
        lyrics: lyricsText ? { text: lyricsText, source: first } : null,
        chords: chordsText ? { text: chordsText, source: first } : null,
      });
      setFetchingLyrics(false);
      setSearchMsg('');
      return;
    }

    const list = candidates.length > 0 ? candidates : [first];
    const startIdx = list.findIndex(c => c.title === first.title && c.artist === first.artist);
    const ordered = [...list.slice(startIdx), ...list.slice(0, startIdx)];

    for (let i = 0; i < ordered.length; i++) {
      const c = ordered[i];
      setSearchMsg(`Obteniendo: ${c.title} - ${c.artist}...`);
      const text = await fetchOne(c, searchMode);
      if (text) {
        const cover = await fetchSpotifyCover(c.title, c.artist);
        onSongFound({
          title: c.title,
          artist: c.artist,
          lyrics: searchMode === 'lyrics' ? text : undefined,
          chords: searchMode === 'chords' ? text : undefined,
          cover,
        });
        setSearchTitle('');
        setSearchArtist('');
        setCandidates([]);
        setSearchMsg(`✅ ${searchMode === 'lyrics' ? 'Letra' : 'Acordes'} encontrados!`);
        setTimeout(() => setSearchMsg(''), 3000);
        setFetchingLyrics(false);
        return;
      }
    }

    setSearchMsg('❌ No se pudo obtener de ningún resultado');
    setTimeout(() => setSearchMsg(''), 3000);
    setFetchingLyrics(false);
  }

  async function retryFetch(type: 'lyrics' | 'chords') {
    if (!candidates.length) return;
    setFetchingTarget(type);

    for (const c of candidates) {
      const existing = combined?.[type];
      if (existing && existing.source.title === c.title && existing.source.artist === c.artist) continue;

      const text = await fetchOne(c, type);
      if (text) {
        setCombined(prev => prev ? { ...prev, [type]: { text, source: c } } : prev);
        setFetchingTarget(null);
        return;
      }
    }

    setSearchMsg(`❌ No se encontraron ${type === 'lyrics' ? 'letras' : 'acordes'} en otras fuentes`);
    setTimeout(() => setSearchMsg(''), 3000);
    setFetchingTarget(null);
  }

  function applyCombined() {
    if (!combined) return;
    const title = combined.lyrics?.source.title || combined.chords?.source.title || '';
    const artist = combined.lyrics?.source.artist || combined.chords?.source.artist || '';
    onSongFound({
      title,
      artist,
      lyrics: combined.lyrics?.text || undefined,
      chords: combined.chords?.text || undefined,
    });
    setCombined(null);
    setSearchTitle('');
    setSearchArtist('');
    setCandidates([]);
  }

  return (
    <div className="space-y-4 p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      <div>
        <div className="flex gap-2">
          <input
            type="text"
            value={scrapeUrl}
            onChange={e => setScrapeUrl(e.target.value)}
            placeholder="Pegar link de letras (Genius, Letras, etc)..."
            className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple/50 transition-all"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          />
          <button
            type="button"
            onClick={async () => {
              if (!scrapeUrl.trim()) return;
              setScraping(true);
              try {
                const res = await fetch('/api/scrape-lyrics', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: scrapeUrl.trim() }),
                });
                const data = await res.json();
                if (data.lyrics || data.title) {
                  const title = data.title || '';
                  const artist = data.artist || '';
                  const cover = await fetchSpotifyCover(title, artist);
                  onSongFound({ title, artist, lyrics: data.lyrics || '', cover });
                  setScrapeUrl('');
                }
              } catch {}
              setScraping(false);
            }}
            className="px-5 py-3 rounded-xl bg-purple hover:bg-purple-light text-white font-medium transition-all flex items-center gap-2 text-sm shadow-sm hover:shadow-md shrink-0"
            style={{ minWidth: '110px' }}
          >
            {scraping ? (
              <span className="flex items-center gap-2"><Spinner size="sm" inline /> Extrayendo...</span>
            ) : (
              <><Link className="w-4 h-4" /> Extraer</>
            )}
          </button>
        </div>
      </div>

      <hr className="border-t" style={{ borderColor: 'var(--border-color)' }} />

      <div className="space-y-3">
        <div className="flex gap-2 items-center">
          <select
            value={searchMode}
            onChange={e => { setSearchMode(e.target.value as SearchMode); setCandidates([]); setSearchMsg(''); setTrySource(0); setHasMore(false); setCombined(null); }}
            className="shrink-0 rounded-xl px-3 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple/50 transition-all appearance-none"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            <option value="lyrics" style={{ background: 'var(--bg-card)' }}>Letra</option>
            <option value="chords" style={{ background: 'var(--bg-card)' }}>Acordes</option>
            <option value="combined" style={{ background: 'var(--bg-card)' }}>Letra + Acordes</option>
          </select>

          <div className="flex flex-1 min-w-0 gap-2">
            <input
              type="text"
              value={searchTitle}
              onChange={e => { setSearchTitle(e.target.value); setCandidates([]); setTrySource(0); setHasMore(false); setCombined(null); }}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="Nombre de la canción..."
              className="flex-1 min-w-0 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple/50 transition-all"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            />
            <input
              type="text"
              value={searchArtist}
              onChange={e => { setSearchArtist(e.target.value); setTrySource(0); setHasMore(false); }}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="Artista (opcional)..."
              className="flex-1 min-w-0 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple/50 transition-all hidden sm:flex"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            />
            <button
              id="external-search-btn"
              type="button"
              onClick={() => doSearch()}
              className="px-5 py-3 rounded-xl bg-purple hover:bg-purple-light text-white font-medium transition-all flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md shrink-0"
              disabled={searching || fetchingLyrics}
              style={{ minWidth: '100px' }}
            >
              {searching || fetchingLyrics ? (
                <span className="flex items-center gap-2"><Spinner size="sm" inline /> Buscando...</span>
              ) : (
                <><Search className="w-4 h-4" /> Buscar</>
              )}
            </button>
          </div>
        </div>

        {searchMsg && (
          <div className={`text-sm text-center font-medium ${searchMsg.includes('✅') ? 'text-green-500' : searchMsg.includes('❌') ? 'text-red-400' : 'text-blue-400'}`}>
            {searchMsg}
            {searchMsg.includes('No se encontraron') && searchMode === 'chords' && (
              <div className="mt-3 text-center">
                <a
                  href={`https://www.cifraclub.com.br/search.php?search=${encodeURIComponent(`${searchTitle} ${searchArtist}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm"
                >
                  <Search className="w-4 h-4" />
                  Buscar en Cifra Club
                </a>
              </div>
            )}
          </div>
        )}

        {!combined && candidates.length > 0 && (
          <div className="space-y-2 pt-2 animate-fade-in">
            {candidates.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectCandidate(c)}
                className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-purple/10"
                style={{ border: '1px solid var(--border-color)' }}
              >
                <Search className="w-4 h-4 shrink-0 text-purple-pastel" />
                <div className="min-w-0">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.title}</span>
                  <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>{c.artist}</span>
                </div>
              </button>
            ))}
            {hasMore && (
              <button
                type="button"
                onClick={() => doSearch(trySource + 1)}
                className="w-full text-center text-sm py-2.5 rounded-xl transition-all hover:bg-purple/5"
                style={{ color: 'var(--text-muted)' }}
              >
                ¿No encontraste lo que buscabas? Buscar en otra fuente
              </button>
            )}
          </div>
        )}

        {/* Panel de resultado combinado */}
        {combined && (
          <div className="space-y-3 pt-2 animate-fade-in">
            <p className="text-xs text-center font-medium" style={{ color: 'var(--text-secondary)' }}>
              {combined.lyrics?.source.title || combined.chords?.source.title || searchTitle}
              {combined.lyrics?.source.artist || combined.chords?.source.artist ? ` — ${combined.lyrics?.source.artist || combined.chords?.source.artist}` : ''}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Panel Letra */}
              <div
                className={`rounded-xl border-2 p-3 min-h-[160px] max-h-[240px] overflow-y-auto transition-all ${combined.lyrics ? 'cursor-pointer' : 'opacity-60'}`}
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-center justify-between mb-2 sticky top-0" style={{ background: 'var(--bg-card)' }}>
                  <span className="text-xs font-semibold text-purple-pastel">Letra</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); retryFetch('lyrics'); }}
                      disabled={fetchingTarget === 'lyrics'}
                      className="p-1 rounded hover:bg-purple/20 transition-colors"
                      title="Buscar en otra fuente"
                    >
                      {fetchingTarget === 'lyrics' ? <Spinner size="sm" inline /> : <RefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
                    </button>
                  </div>
                </div>
                {combined.lyrics ? (
                  <pre className="text-xs whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {combined.lyrics.text.slice(0, 400)}{combined.lyrics.text.length > 400 ? '...' : ''}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 text-center">
                    <Music className="w-5 h-5 mb-1.5" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No disponible</p>
                  </div>
                )}
              </div>

              {/* Panel Acordes */}
              <div
                className={`rounded-xl border-2 p-3 min-h-[160px] max-h-[240px] overflow-y-auto transition-all ${combined.chords ? 'cursor-pointer' : 'opacity-60'}`}
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-center justify-between mb-2 sticky top-0" style={{ background: 'var(--bg-card)' }}>
                  <span className="text-xs font-semibold text-purple-pastel">Acordes</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); retryFetch('chords'); }}
                      disabled={fetchingTarget === 'chords'}
                      className="p-1 rounded hover:bg-purple/20 transition-colors"
                      title="Buscar en otra fuente"
                    >
                      {fetchingTarget === 'chords' ? <Spinner size="sm" inline /> : <RefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
                    </button>
                  </div>
                </div>
                {combined.chords ? (
                  <pre className="text-xs whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {combined.chords.text.slice(0, 400)}{combined.chords.text.length > 400 ? '...' : ''}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 text-center">
                    <Music className="w-5 h-5 mb-1.5" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No disponible</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setCombined(null); setCandidates([]); }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl transition-colors text-sm font-medium"
                style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
              >
                Volver
              </button>
              <button
                onClick={applyCombined}
                disabled={!combined.lyrics && !combined.chords}
                className="flex-1 flex items-center justify-center gap-2 bg-purple hover:bg-purple-light text-white font-medium px-5 py-2.5 rounded-xl transition-all text-sm disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Aplicar selección
              </button>
            </div>
          </div>
        )}

        {!combined && candidates.length === 0 && hasMore && (
          <div className="pt-2 text-center animate-fade-in">
            <button
              type="button"
              onClick={() => doSearch(trySource + 1)}
              className="text-sm py-2.5 px-5 rounded-xl transition-all hover:bg-purple/5"
              style={{ color: 'var(--text-muted)' }}
            >
              Buscar en otra fuente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
