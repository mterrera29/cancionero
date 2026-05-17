'use client';

import { useState } from 'react';
import { Link, Search } from 'lucide-react';

interface SongSearchInputsProps {
  onSongFound: (data: { title: string; artist: string; lyrics: string; cover?: string }) => void;
}

interface Candidate {
  title: string;
  artist: string;
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

  function norm(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  async function doSearch() {
    if (!searchTitle.trim()) return;
    const songTitle = searchTitle.trim();
    const songArtist = searchArtist.trim();

    setSearching(true);
    setSearchMsg('Buscando...');
    setCandidates([]);
    try {
      const res = await fetch('/api/google-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: songTitle, mode: 'search' }),
      });
      const data = await res.json();
      if (data.candidates?.length > 0) {
        let filtered: Candidate[] = data.candidates;
        if (songArtist) {
          const na = norm(songArtist);
          filtered = filtered.filter(c => norm(c.artist).includes(na));
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
      } else {
        setSearchMsg('❌ No se encontraron resultados');
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
      setSearchMsg(`Obteniendo letra: ${c.title} - ${c.artist}...`);
      try {
        const query = `${c.title} - ${c.artist}`;
        const res = await fetch('/api/google-lyrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: c.title, artist: c.artist, query }),
        });
        const data = await res.json();
        if (data.lyrics || data.title) {
          const cover = await fetchSpotifyCover(data.title || c.title, data.artist || c.artist);
          onSongFound({
            title: data.title || c.title,
            artist: data.artist || c.artist,
            lyrics: data.lyrics || '',
            cover,
          });
          setSearchTitle('');
          setSearchArtist('');
          setCandidates([]);
          setSearchMsg('✅ Letra encontrada!');
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
    <div className="space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
      <div>
        <div className="flex gap-2">
          <input type="text" value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)}
            placeholder="Pegar link de letras (Genius, Letras, etc)..."
            className="flex-1 bg-purple-dark/80 border border-purple/30 rounded-xl px-4 py-3 text-sm text-white/70 placeholder-white/35 focus:outline-none focus:border-purple-light transition-colors"
          />
          <button type="button" onClick={async () => {
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
          }} className="px-4 rounded-xl bg-purple hover:bg-purple-light text-white transition-colors flex items-center gap-2 text-sm">
            {scraping ? '...' : <><Link className="w-4 h-4" /> Extraer</>}
          </button>
        </div>
      </div>

      <hr className="border-purple/20" />

      <div className="space-y-2">
        <div className="flex gap-2">
          <input type="text" value={searchTitle} onChange={e => { setSearchTitle(e.target.value); setCandidates([]); }}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Nombre de la canción..."
            className="flex-1 bg-purple-dark/80 border border-purple/30 rounded-xl px-4 py-3 text-sm text-white/70 placeholder-white/35 focus:outline-none focus:border-purple-light transition-colors"
          />
          <input type="text" value={searchArtist} onChange={e => setSearchArtist(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Artista (opcional)..."
            className="flex-1 bg-purple-dark/80 border border-purple/30 rounded-xl px-4 py-3 text-sm text-white/70 placeholder-white/35 focus:outline-none focus:border-purple-light transition-colors"
          />
          <button id="external-search-btn" type="button" onClick={doSearch}
            className="px-4 rounded-xl bg-purple hover:bg-purple-light text-white transition-colors flex items-center gap-2 text-sm shrink-0">
            {searching || fetchingLyrics ? '...' : <><Search className="w-4 h-4" /> Buscar</>}
          </button>
        </div>
        {searchMsg && (
          <p className="text-xs text-center" style={{ color: searchMsg.includes('✅') ? '#4ade80' : '#f87171' }}>
            {searchMsg}
          </p>
        )}
        {candidates.length > 0 && (
          <div className="space-y-1 pt-1">
            {candidates.map((c, i) => (
              <button key={i} type="button" onClick={() => selectCandidate(c)}
                className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors hover:bg-purple/20"
                style={{ border: '1px solid var(--border-color)' }}>
                <Search className="w-3.5 h-3.5 shrink-0 text-purple-pastel" />
                <div className="min-w-0">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.title}</span>
                  <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>{c.artist}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
