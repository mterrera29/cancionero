import type { ChordsProvider } from './types'

export const ultimateGuitarProvider: ChordsProvider = {
  name: 'ultimate-guitar',
  async fetchChords(title: string, artist: string): Promise<string | null> {
    try {
      const { searchSong, fetchChords, category } = await import('ultimate-guitar')

      const searchResult = await searchSong(title, artist || null, category.CHORDS)
      if (searchResult.status !== 200 || !Array.isArray(searchResult.responses) || searchResult.responses.length === 0) {
        return null
      }

      for (const tab of searchResult.responses.slice(0, 3)) {
        const result = await fetchChords(tab)
        if (result.status === 200 && result.response) {
          const text = result.response
            .replace(/<[^>]+>/g, '')
            .trim()
          if (text.length > 50) return text
        }
      }
    } catch {}

    return null
  },
}
