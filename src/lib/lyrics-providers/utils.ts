export function cleanHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .trim()
}

export function addSpacingBeforeSections(text: string): string {
  return text
    .replace(/\n*(\[[A-Za-zÁÉÍÓÚÑ][^\]]*\])/g, '\n\n$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/[^a-z0-9áéíóúñ]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function underscoreSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

export function fixCase(s: string): string {
  if (s.length < 2 || /[a-z]/.test(s)) return s
  return s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B[A-Z]/g, (c) => c.toLowerCase())
}

export function clean(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function fixTitle(s: string): string {
  return s
    .replace(/ \(Letra.*$| - Letras.*$| Lyrics.*| \| Genius.*$/i, '')
    .trim()
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

export function fetchText(url: string): Promise<string> {
  return fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8' },
  }).then((r) => r.text())
}

export function fetchJson<T>(url: string): Promise<T> {
  return fetch(url, {
    headers: { 'User-Agent': UA },
  }).then((r) => r.json())
}
