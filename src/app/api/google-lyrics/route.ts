import { NextResponse } from 'next/server';

// ── Search sources (never exposed in UI) ──

async function deezerSearch(query: string): Promise<{ title: string; artist: string }[]> {
  const res = await fetch(
    `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=10`,
    { headers: { 'Accept': 'application/json' } }
  );
  if (!res.ok) throw new Error(`search error: ${res.status}`);
  const data = await res.json();
  const seen = new Set<string>();
  return (data.data || [])
    .map((t: any) => ({
      title: fixCase(t.title || ''),
      artist: fixCase(t.artist?.name || ''),
    }))
    .filter((c: { title: string; artist: string }) => {
      const key = `${c.title}|${c.artist}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return c.title && c.artist;
    });
}

async function itunesSearch(query: string): Promise<{ title: string; artist: string }[]> {
  const res = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10`,
    { headers: { 'Accept': 'application/json' } }
  );
  if (!res.ok) throw new Error(`search error: ${res.status}`);
  const data = await res.json();
  const seen = new Set<string>();
  return (data.results || [])
    .map((t: any) => ({
      title: fixCase(t.trackName || ''),
      artist: fixCase(t.artistName || ''),
    }))
    .filter((c: { title: string; artist: string }) => {
      const key = `${c.title}|${c.artist}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return c.title && c.artist;
    });
}

const SOURCES = [deezerSearch, itunesSearch];

function fixCase(s: string): string {
  if (s.length < 2 || /[a-z]/.test(s)) return s;
  return s.replace(/\b\w/g, c => c.toUpperCase()).replace(/\B[A-Z]/g, c => c.toLowerCase());
}

function clean(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n').trim();
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/g, '-').replace(/^-|-$/g, '');
}

const SITES = [
  {
    name: 'letras.com',
    url: (a: string, t: string) => `https://www.letras.com/${slug(a)}/${slug(t)}/`,
    pattern: /<div[^>]*class="[^"]*lyric-original[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  },
  {
    name: 'letras.mus.br',
    url: (a: string, t: string) => `https://www.letras.mus.br/${slug(a)}/${slug(t)}/`,
    pattern: /<div[^>]*class="[^"]*lyric-original[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  },
  {
    name: 'genius.com',
    url: (a: string, t: string) => `https://genius.com/${slug(a)}-${slug(t)}-lyrics`,
    pattern: /<div[^>]*data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/i,
  },
];

async function trySite(url: string, pattern: RegExp): Promise<string | null> {
  try {
    const html = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    }).then(r => r.text());
    if (html.length > 5000 && !/page not found|não encontrada|404|Page Not Found/i.test(html)) {
      const m = html.match(pattern);
      if (m) {
        const lyrics = clean(m[1]);
        return lyrics.length > 50 ? lyrics : null;
      }
    }
  } catch {}
  return null;
}

async function getMeta(url: string): Promise<{ title: string; artist: string } | null> {
  try {
    const html = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    }).then(r => r.text());
    const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (!match) return null;
    let t = match[1]
      .replace(/ - (Letras\.com|LETRAS\.COM|Letras\.mus\.br|Genius|lyrics).*$/i, '')
      .replace(/ \| (Genius|Genius Lyrics).*$/i, '')
      .trim();
    const parts = t.split(' - ');
    if (parts.length >= 2) return { title: fixCase(parts[0].trim()), artist: fixCase(parts.slice(1).join(' - ').trim()) };
    return { title: fixCase(t), artist: '' };
  } catch { return null; }
}

async function searchCandidates(query: string, trySource = -1): Promise<{ candidates: { title: string; artist: string }[]; hasMore: boolean }> {
  if (trySource >= 0) {
    // Specific source requested (from "try another" button)
    const result = await SOURCES[trySource](query);
    return { candidates: result, hasMore: trySource + 1 < SOURCES.length };
  }
  // Auto: try all sources, return first with results
  for (let i = 0; i < SOURCES.length; i++) {
    const result = await SOURCES[i](query);
    if (result.length > 0) {
      return { candidates: result, hasMore: i + 1 < SOURCES.length };
    }
  }
  return { candidates: [], hasMore: false };
}

async function tryLyrics(title: string, artist: string): Promise<{ title: string; artist: string; lyrics: string } | null> {
  for (const site of SITES) {
    const url = site.url(artist, title);
    const lyrics = await trySite(url, site.pattern);
    if (lyrics) {
      const meta = await getMeta(url);
      return { title: meta?.title || title, artist: meta?.artist || artist, lyrics };
    }
  }
  try {
    const api = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    ).then(r => r.json());
    if (api.lyrics) {
      const lyrics = clean(api.lyrics);
      if (lyrics.length > 30) return { title, artist, lyrics };
    }
  } catch {}
  return null;
}

function artistParts(name: string): string[] {
  const parts: string[] = [name];
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    parts.push(words[0]);
    parts.push(words[words.length - 1]);
    parts.push(words.slice(0, -1).join(' '));
    if (words.length > 2) {
      parts.push(words.slice(-2).join(' '));
      parts.push(words.slice(0, 2).join(' '));
    }
  }
  return [...new Set(parts)];
}

async function fetchLyrics(searchTitle: string, searchArtist: string): Promise<{ title: string; artist: string; lyrics: string } | null> {
  // If artist is provided, try each variation
  if (searchArtist) {
    const artists = artistParts(searchArtist);
    for (const a of artists) {
      const result = await tryLyrics(searchTitle, a);
      if (result) return result;
    }
  }

  // Without artist, try Genius direct URL
  if (!searchArtist) {
    const url = `https://genius.com/${slug(searchTitle)}-lyrics`;
    const lyrics = await trySite(url, SITES[2].pattern);
    if (lyrics) {
      const meta = await getMeta(url);
      return { title: meta?.title || searchTitle, artist: meta?.artist || '', lyrics };
    }
  }

  // Search candidates and try each one
  const { candidates } = await searchCandidates(searchTitle);
  for (const c of candidates) {
    const result = await tryLyrics(c.title, c.artist);
    if (result) return result;
    // Also try with the original search title
    const result2 = await tryLyrics(searchTitle, c.artist);
    if (result2) return result2;
  }

  // Last resort: try splitting query into last words as artist guess
  if (!searchArtist) {
    const words = searchTitle.split(/\s+/);
    if (words.length >= 3) {
      for (let i = 1; i < words.length; i++) {
        const possibleArtist = words.slice(i).join(' ');
        const possibleTitle = words.slice(0, i).join(' ');
        const result = await tryLyrics(possibleTitle, possibleArtist);
        if (result) return result;
      }
    }
  }

  return null;
}

// ── Chord scraping ──

function slugifyChord(s: string): string {
  return s.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fetchChords(searchTitle: string, searchArtist: string): Promise<string | null> {
  // Try 1: Direct GuitarTabs.cc URL (they use underscores)
  if (searchArtist) {
    const artistSlug = searchArtist.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const titleSlug = searchTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const firstLetter = artistSlug.charAt(0);
    const url = `https://www.guitartabs.cc/tabs/${firstLetter}/${artistSlug}/${titleSlug}_crd.html`;
    const content = await fetchGuitarTabsContent(url);
    if (content) return content;
  }

  // Try 2: Search via Chordie to find guitar tabs URLs
  try {
    const chordieUrl = `https://www.chordie.com/allsongs.php/songtitle/${slugifyChord(searchTitle)}/songartist/${slugifyChord(searchArtist || searchTitle)}/`;
    const res = await fetch(chordieUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await res.text();
    const tabMatches = html.match(/chord\.pere\/(www\.guitartabs\.cc[^"'\s]+)/g);
    if (tabMatches) {
      for (const match of tabMatches) {
        const path = match.replace(/^chord\.pere\//, '');
        const content = await fetchGuitarTabsContent(`https://www.${path}`);
        if (content) return content;
      }
    }
  } catch {}

  return null;
}

async function fetchGuitarTabsContent(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await res.text();

    const preRegex = /<pre[^>]*>([\s\S]*?)<\/pre>/gi;
    const contents: string[] = [];
    let match;
    while ((match = preRegex.exec(html)) !== null) {
      const text = match[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .trim();
      if (text.length > 50) contents.push(text);
    }

    return contents.length > 0 ? contents.join('\n\n') : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { title, artist, query, mode, try_source, search_mode } = await request.json();
    if (!title && !query) return NextResponse.json({ error: 'Título requerido' }, { status: 400 });

    const searchTitle = title || query || '';
    const searchArtist = artist || '';

    // Search mode: return multiple candidates (try_source = which source index to use, -1 = auto)
    if (mode === 'search') {
      const { candidates, hasMore } = await searchCandidates(searchTitle, try_source ?? -1);
      return NextResponse.json({ candidates, hasMore });
    }

    // Chord mode: fetch chords
    if (search_mode === 'chords') {
      const chords = await fetchChords(searchTitle, searchArtist);
      if (chords) {
        return NextResponse.json({ title: searchTitle, artist: searchArtist, chords });
      }
      return NextResponse.json({ error: 'No se encontraron acordes' }, { status: 404 });
    }

    // Normal mode: fetch lyrics directly
    const result = await fetchLyrics(searchTitle, searchArtist);
    if (result) return NextResponse.json(result);

    return NextResponse.json({ error: 'No se encontró la letra' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al buscar' }, { status: 500 });
  }
}