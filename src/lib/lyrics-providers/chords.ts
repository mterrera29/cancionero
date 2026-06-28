import type { ChordsProvider } from './types'
import { underscoreSlug, fetchText } from './utils'

export const guitarTabsProvider: ChordsProvider = {
  name: 'guitartabs.cc',
  async fetchChords(title: string, artist: string): Promise<string | null> {
    // Try direct URL
    if (artist) {
      const artistSlug = underscoreSlug(artist)
      const titleSlug = underscoreSlug(title)
      const firstLetter = artistSlug.charAt(0)
      const url = `https://www.guitartabs.cc/tabs/${firstLetter}/${artistSlug}/${titleSlug}_crd.html`
      const content = await fetchGuitarTabsContent(url)
      if (content) return content
    }

    // Fallback: search via Chordie
    try {
      const chordieUrl = `https://www.chordie.com/allsongs.php/songtitle/${slugifyChord(title)}/songartist/${slugifyChord(artist || title)}/`
      const res = await fetch(chordieUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      })
      const html = await res.text()
      const tabMatches = html.match(/chord\.pere\/(www\.guitartabs\.cc[^"'\s]+)/g)
      if (tabMatches) {
        for (const match of tabMatches) {
          const path = match.replace(/^chord\.pere\//, '')
          const content = await fetchGuitarTabsContent(`https://www.${path}`)
          if (content) return content
        }
      }
    } catch {}

    return null
  },
}

async function fetchGuitarTabsContent(url: string): Promise<string | null> {
  try {
    const html = await fetchText(url)
    const preRegex = /<pre[^>]*>([\s\S]*?)<\/pre>/gi
    const contents: string[] = []
    let match
    while ((match = preRegex.exec(html)) !== null) {
      const text = match[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim()
      if (text.length > 50) contents.push(text)
    }
    return contents.length > 0 ? contents.join('\n\n') : null
  } catch {
    return null
  }
}

function slugifyChord(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
