import { normalizeForMatch } from '@/lib/lyric-follow';

export const SPEECH_UNSUPPORTED_MESSAGE =
  'Tu navegador no puede seguir la canción por la voz. Probá con Chrome, Edge o Safari, en HTTPS o en localhost.';

export const SPEECH_DENIED_MESSAGE =
  'No pudimos usar el micrófono. Habilitá el permiso en el navegador y volvé a intentar el seguimiento por audio.';

export const SPEECH_INSECURE_MESSAGE =
  'El navegador bloqueó el micrófono. El seguimiento por audio necesita HTTPS o localhost, y permiso para grabar.';

export const SPEECH_NO_MIC_MESSAGE =
  'No encontramos un micrófono disponible para el seguimiento por audio.';

export const SPEECH_LANGUAGE_MESSAGE =
  'Este navegador no puede reconocer el idioma de la canción para el seguimiento por audio.';

const FATAL_SPEECH_ERRORS = new Set([
  'not-allowed',
  'service-not-allowed',
  'audio-capture',
  'aborted',
  'language-not-supported',
]);

const ES_HINTS = new Set([
  'que', 'el', 'la', 'los', 'las', 'una', 'del', 'por', 'con', 'como', 'para', 'sus',
  'pero', 'cuando', 'esto', 'esta', 'hay', 'porque',
]);

const EN_HINTS = new Set([
  'the', 'and', 'you', 'your', 'that', 'with', 'this', 'have', 'from', 'was', 'are', 'my',
]);

export function shouldRestartAfterSpeechError(code: string): boolean {
  return !FATAL_SPEECH_ERRORS.has(code);
}

export function messageForSpeechError(code: string): string {
  if (code === 'not-allowed') return SPEECH_DENIED_MESSAGE;
  if (code === 'service-not-allowed') return SPEECH_INSECURE_MESSAGE;
  if (code === 'audio-capture') return SPEECH_NO_MIC_MESSAGE;
  if (code === 'language-not-supported') return SPEECH_LANGUAGE_MESSAGE;
  return SPEECH_UNSUPPORTED_MESSAGE;
}

/**
 * es-AR por defecto. Si la canción trae idioma, se usa ese.
 * Si no hay campo, se estima con la letra (las demos en inglés no deberían forzar es-AR).
 */
export function inferRecognitionLang(input: {
  language?: string | null;
  lyrics?: string | null;
}): string {
  const explicit = input.language?.trim();
  if (explicit) return canonicalizeLang(explicit);

  const tokens = normalizeForMatch(input.lyrics ?? '').split(' ').filter(Boolean);
  if (tokens.length < 8) return 'es-AR';

  let spanish = 0;
  let english = 0;
  for (const token of tokens) {
    if (ES_HINTS.has(token)) spanish += 1;
    if (EN_HINTS.has(token)) english += 1;
  }
  if (english >= 3 && english > spanish + 1) return 'en-US';
  return 'es-AR';
}

function canonicalizeLang(lang: string): string {
  const lower = lang.trim().toLowerCase().replace(/_/g, '-');
  if (['es', 'spa', 'spanish', 'espanol', 'español'].includes(lower)) return 'es-AR';
  if (['en', 'english', 'ingles', 'inglés'].includes(lower)) return 'en-US';
  if (['pt', 'portuguese', 'portugues', 'português'].includes(lower)) return 'pt-BR';

  const parts = lower.split('-').filter(Boolean);
  if (parts.length >= 2 && /^[a-z]{2,3}$/.test(parts[0]) && /^[a-z0-9]{2,8}$/.test(parts[1])) {
    return `${parts[0]}-${parts[1].toUpperCase()}`;
  }
  return 'es-AR';
}
