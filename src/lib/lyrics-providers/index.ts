import type { LyricsResult, LyricsProvider, ChordsProvider } from './types'
import { geniusProvider } from './genius'
import { lyricsOvhProvider } from './lyrics-ovh'
import { musixmatchProvider } from './musixmatch'
import { lrclibProvider } from './lrclib'
import { guitarTabsProvider } from './chords'
import { ultimateGuitarProvider } from './ultimate-guitar'
import { searchCandidates } from './search'
export { searchCandidates }

const lyricsProviders: LyricsProvider[] = [
  geniusProvider,
  musixmatchProvider,
  lrclibProvider,
  lyricsOvhProvider,
]

const chordsProviders: ChordsProvider[] = [
  ultimateGuitarProvider,
  guitarTabsProvider,
]

function artistParts(name: string): string[] {
  const parts: string[] = [name]
  const words = name.split(/\s+/).filter(Boolean)
  if (words.length > 1) {
    parts.push(words[0])
    parts.push(words[words.length - 1])
    parts.push(words.slice(0, -1).join(' '))
    if (words.length > 2) {
      parts.push(words.slice(-2).join(' '))
      parts.push(words.slice(0, 2).join(' '))
    }
  }
  return [...new Set(parts)]
}

export async function fetchLyrics(
  searchTitle: string,
  searchArtist: string
): Promise<LyricsResult | null> {
  if (searchArtist) {
    const artists = artistParts(searchArtist)
    for (const a of artists) {
      for (const provider of lyricsProviders) {
        const result = await provider.fetchLyrics(searchTitle, a)
        if (result) return result
      }
    }
  }

  // Without artist, try each provider
  for (const provider of lyricsProviders) {
    const result = await provider.fetchLyrics(searchTitle, '')
    if (result) return result
  }

  // Search candidates and try each one
  const { candidates } = await searchCandidates(searchTitle)
  for (const c of candidates) {
    for (const provider of lyricsProviders) {
      const result = await provider.fetchLyrics(c.title, c.artist)
      if (result) return result
    }
    for (const provider of lyricsProviders) {
      const result = await provider.fetchLyrics(searchTitle, c.artist)
      if (result) return result
    }
  }

  return null
}

export async function fetchChords(
  searchTitle: string,
  searchArtist: string
): Promise<string | null> {
  for (const provider of chordsProviders) {
    const result = await provider.fetchChords(searchTitle, searchArtist)
    if (result) return result
  }
  return null
}
