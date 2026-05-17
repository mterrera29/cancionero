import { NextResponse } from 'next/server';

function cleanHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
    .trim();
}

function addSpacingBeforeSections(text: string): string {
  // Add extra newline before section markers like [Verse], [Chorus], etc.
  return text
    .replace(/\n*(\[[A-Za-zÁÉÍÓÚÑ][^\]]*\])/g, '\n\n$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'URL requerida' }, { status: 400 });

    const text = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
      },
    }).then(r => r.text());

    const result: { title?: string; artist?: string; lyrics?: string } = {};

    // --- Genius internal API ---
    const songId = text.match(/"apiPath":"\/songs\/(\d+)"/);
    if (songId) {
      try {
        const api = await fetch(`https://genius.com/api/songs/${songId[1]}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
        }).then(r => r.json());
        const s = api?.response?.song;
        if (s) {
          result.title = s.title;
          result.artist = s.artist_names;
          if (s.embed_content) {
            const lyrics = cleanHtml(s.embed_content);
            if (lyrics.length > 50) result.lyrics = addSpacingBeforeSections(lyrics);
          }
        }
      } catch {}
    }

    // --- Letras.com (lyric-original) ---
    if (!result.lyrics) {
      const lyrDiv = text.match(/<div[^>]*class="[^"]*lyric-original[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
      if (lyrDiv) {
        const lyrics = cleanHtml(lyrDiv[1]);
        if (lyrics.length > 50) result.lyrics = addSpacingBeforeSections(lyrics);
      }
    }

    // --- CifraClub / others with <pre> tags ---
    if (!result.lyrics) {
      const preTags = text.match(/<pre[^>]*>([\s\S]*?)<\/pre>/gi);
      if (preTags) {
        const combined = preTags
          .map(p => cleanHtml(p))
          .filter(t => t.length > 50)
          .join('\n\n');
        if (combined.length > 50) result.lyrics = addSpacingBeforeSections(combined);
      }
    }

    // --- Generic: <div class="cnt-letra"> ---
    if (!result.lyrics) {
      const cnt = text.match(/<div[^>]*class="[^"]*cnt-letra[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
      if (cnt) {
        const lyrics = cleanHtml(cnt[1]);
        if (lyrics.length > 50) result.lyrics = addSpacingBeforeSections(lyrics);
      }
    }

    // --- Generic: <div class="lyrics"> or <div id="lyrics"> ---
    if (!result.lyrics) {
      for (const pattern of [
        /<div[^>]*class="[^"]*\blyrics\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<div[^>]*id="lyrics"[^>]*>([\s\S]*?)<\/div>/i,
        /<pre[^>]*class="[^"]*lyrics[^"]*"[^>]*>([\s\S]*?)<\/pre>/i,
      ]) {
        const m = text.match(pattern);
        if (m) {
          const lyrics = cleanHtml(m[1]);
          if (lyrics.length > 50) { result.lyrics = addSpacingBeforeSections(lyrics); break; }
        }
      }
    }

    // --- Fallback: filter paragraphs that look like lyrics ---
    if (!result.lyrics || result.lyrics.length < 50) {
      const pBlocks = text.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
      if (pBlocks) {
        const paragraphs = pBlocks
          .map(p => cleanHtml(p))
          .filter(p => {
            const t = p.trim();
            return t.length > 30 && t.length < 500 
              && /[a-zA-Záéíóúñ]{3,}/.test(t)
              && !/cookie|javascript|function|localStorage/.test(t);
          });
        if (paragraphs.length > 0) {
          result.lyrics = paragraphs.join('\n\n');
        }
      }
    }

    // --- Extract meta info ---
    const ogTitle = text.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/);
    if (ogTitle) {
      const t = ogTitle[1].replace(/ \(Letra.*$| - Letras.*$| Lyrics.*$/i, '').trim();
      const parts = t.split(' - ');
      if (parts.length >= 2 && !result.title) {
        result.title = parts[0].trim();
        result.artist = parts.slice(1).join(' - ').replace(/ \|.*$/, '').trim();
      } else if (!result.title) {
        result.title = t;
      }
    }

    const pageTitle = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (pageTitle && (!result.title || !result.artist)) {
      const t = pageTitle[1].replace(/ \(Letra.*$| - Letras.*$| Lyrics.*$/i, '').trim();
      const parts = t.split(' - ');
      if (parts.length >= 2) {
        result.title = result.title || parts[0].trim();
        result.artist = result.artist || parts[parts.length - 1].replace(/ \|.*$/, '').trim();
      } else {
        result.title = result.title || t;
      }
    }

    // Try <meta name="description"> with lyrics snippet as fallback
    if (!result.lyrics && !result.title) {
      const metaDesc = text.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i);
      if (metaDesc) {
        const content = metaDesc[1];
        const parts = content.split(' - ');
        if (parts.length >= 2 && !result.title) {
          result.title = parts[0].trim();
          result.artist = parts.slice(1).join(' - ').trim();
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar la URL' }, { status: 500 });
  }
}