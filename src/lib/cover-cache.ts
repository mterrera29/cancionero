const cache = new Map<string, string | null>()

export function getCachedCover(query: string): string | null | undefined {
  return cache.get(query)
}

export function setCachedCover(query: string, cover: string | null): void {
  cache.set(query, cover)
}
