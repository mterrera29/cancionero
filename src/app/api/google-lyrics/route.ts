import { NextResponse } from 'next/server';
import { fetchLyrics, fetchChords, searchCandidates } from '@/lib/lyrics-providers';

export async function POST(request: Request) {
  try {
    const { title, artist, query, mode, try_source, search_mode } = await request.json();
    if (!title && !query) return NextResponse.json({ error: 'Título requerido' }, { status: 400 });

    const searchTitle = title || query || '';
    const searchArtist = artist || '';

    // Search mode: return multiple candidates
    if (mode === 'search') {
      const { candidates, hasMore } = await searchCandidates(searchTitle, try_source ?? -1);
      const searchWords = searchTitle.toLowerCase().split(/\s+/).filter(Boolean);
      const filtered = searchWords.length > 0
        ? candidates.filter(c => {
            const ct = c.title.toLowerCase();
            return searchWords.some((w: string) => ct.includes(w));
          })
        : candidates;
      return NextResponse.json({ candidates: filtered, hasMore: filtered.length > 0 ? hasMore : false });
    }

    // Chord mode
    if (search_mode === 'chords') {
      const chords = await fetchChords(searchTitle, searchArtist);
      if (chords) {
        return NextResponse.json({ title: searchTitle, artist: searchArtist, chords });
      }
      return NextResponse.json({ error: 'No se encontraron acordes' }, { status: 404 });
    }

    // Normal mode: fetch lyrics via provider chain
    const result = await fetchLyrics(searchTitle, searchArtist);
    if (result) return NextResponse.json(result);

    return NextResponse.json({ error: 'No se encontró la letra' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al buscar' }, { status: 500 });
  }
}
