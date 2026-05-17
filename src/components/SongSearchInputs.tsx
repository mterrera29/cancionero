'use client';

import { useState } from 'react';
import { Link, Search } from 'lucide-react';
import Spinner from './Spinner';

interface SongSearchInputsProps {
  onSongFound: (data: { title: string; artist: string; lyrics?: string; chords?: string; cover?: string }) => void;
}

interface Candidate {
  title: string;
  artist: string;
}

type SearchMode = 'lyrics' | 'chords';

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
        // Filtrar candidatos cuyo título no contenga NINGUNA palabra de la búsqueda
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

          if (filtered.length === 1) {
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

  async function selectCandidate(first: Candidate) {
    setFetchingLyrics(true);
    const list = candidates.length > 0 ? candidates : [first];
    const startIdx = list.findIndex(c => c.title === first.title && c.artist === first.artist);
    const ordered = [...list.slice(startIdx), ...list.slice(0, startIdx)];

    for (let i = 0; i < ordered.length; i++) {
      const c = ordered[i];
      setSearchMsg(`Obteniendo ${searchMode === 'lyrics' ? 'letra' : 'acordes'}: ${c.title} - ${c.artist}...`);
      try {
        const cleanTitle = cleanSearchTitle(c.title);
        const query = `${cleanTitle} - ${c.artist}`;
        const res = await fetch('/api/google-lyrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: cleanTitle,
            artist: c.artist,
            query,
            search_mode: searchMode,
          }),
        });
        const data = await res.json();
        if ((data.lyrics || data.chords) || data.title) {
          const cover = await fetchSpotifyCover(data.title || cleanTitle, data.artist || c.artist);
          onSongFound({
            title: data.title || cleanTitle,
            artist: data.artist || c.artist,
            lyrics: searchMode === 'lyrics' ? (data.lyrics || '') : undefined,
            chords: searchMode === 'chords' ? (data.chords || '') : undefined,
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
      } catch {}
    }

    setSearchMsg('❌ No se pudo obtener la letra de ningún resultado');
    setTimeout(() => setSearchMsg(''), 3000);
    setFetchingLyrics(false);
  }

  return (
    <div className="space-y-4 p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      {/* Sección para pegar URL */}
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

      {/* Sección de búsqueda por título/artista */}
      <div className="space-y-3">
        <div className="flex gap-2 items-center">
          <select
            value={searchMode}
            onChange={e => { setSearchMode(e.target.value as SearchMode); setCandidates([]); setSearchMsg(''); setTrySource(0); setHasMore(false); }}
            className="shrink-0 rounded-xl px-3 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple/50 transition-all appearance-none"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            <option value="lyrics" style={{ background: 'var(--bg-card)' }}>Letra</option>
            <option value="chords" style={{ background: 'var(--bg-card)' }}>Acordes</option>
          </select>
          
          <div className="flex flex-1 min-w-0 gap-2">
            <input
              type="text"
              value={searchTitle}
              onChange={e => { setSearchTitle(e.target.value); setCandidates([]); setTrySource(0); setHasMore(false); }}
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

        {/* Mensajes de estado */}
        {searchMsg && (
          <div className={`text-sm text-center font-medium ${searchMsg.includes('✅') ? 'text-green-500' : searchMsg.includes('❌') ? 'text-red-400' : 'text-blue-400'}`}>
            {searchMsg}
            {/* Botón para buscar en Cifra Club si no se encontraron acordes */}
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

        {/* Resultados de búsqueda */}
        {candidates.length > 0 && (
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

        {/* Fallback cuando no hay resultados pero hay más fuentes */}
        {candidates.length === 0 && hasMore && (
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
