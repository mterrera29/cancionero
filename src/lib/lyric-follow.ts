/**
 * Alinea una transcripción reciente con las líneas de una canción.
 * Puro: sin DOM, sin micrófono, para poder testearlo con una transcripción simulada.
 */

export const DEFAULT_MIN_CONFIDENCE = 0.62;
export const DEFAULT_HIGH_CONFIDENCE = 0.84;
const DEFAULT_WINDOW_WORDS = 8;
const LOCAL_BACK_TOKENS = 16;
const LOCAL_FORWARD_TOKENS = 40;
const SLICE_SLACK = 4;
const LOOKAHEAD = 2;
const JUMP_MARGIN = 0.18;

const STOPWORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'y', 'o', 'u',
  'que', 'en', 'con', 'por', 'se', 'su', 'sus', 'mi', 'tu', 'te', 'me', 'lo', 'le', 'les',
  'es', 'ya', 'muy', 'mas', 'no', 'si', 'tan', 'como', 'para', 'cuando', 'donde', 'a', 'sin',
  'the', 'and', 'or', 'of', 'to', 'in', 'on', 'my', 'me', 'it', 'you', 'your', 'that', 'this',
  'for', 'with', 'is', 'are', 'was', 'be', 'as', 'at', 'from', 'but', 'not', 'so', 'if', 'we',
  'i', 'am', 'oh',
]);

const SECTION_LINE =
  /^(?:intro|outro|instrumental|solo|riff|interludio|interlude|puente|coro|estribillo|verso|estrofa|pre coro|precoro|verse|chorus|bridge|pre chorus|prechorus|tab)(?:\s+\d+)?$/;

const CHORD_PATTERN =
  /^[a-g](?:#|b)?(?:m|maj|min|dim|aug|sus|add)?\d{0,2}(?:sus\d?|add\d{0,2}|maj\d{0,2}|m)?(?:\/[a-g](?:#|b)?)?$/;

export interface AlignOptions {
  transcript: string;
  lines: string[];
  /** Línea que estamos siguiendo. Null si todavía no hay ancla. */
  currentIndex: number | null;
  windowWords?: number;
  minConfidence?: number;
  highConfidence?: number;
}

export interface AlignResult {
  /** Línea a mostrar. Si no hay que moverse, se conserva currentIndex (puede ser null). */
  lineIndex: number | null;
  confidence: number;
  moved: boolean;
}

interface TokenRef {
  lineIndex: number;
  token: string;
}

interface ScoredMatch {
  score: number;
  endToken: number;
  endLine: number;
}

export function normalizeForMatch(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’´`]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isIgnorableLyricLine(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  if (isTabLine(trimmed)) return true;
  if (/^\[.*\]$/.test(trimmed)) return true;
  if (/^\([^)]*\)$/.test(trimmed) && /intro|outro|solo|instrumental|riff|puente|coro|verso|bridge|chorus|verse|estribillo/i.test(trimmed)) {
    return true;
  }
  const normalized = normalizeForMatch(trimmed);
  if (!normalized) return true;
  if (SECTION_LINE.test(normalized)) return true;
  const rawTokens = trimmed.split(/\s+/);
  return rawTokens.length > 0 && rawTokens.every((token) => isChordToken(token));
}

export function fuzzyTokenEqual(a: string, b: string): boolean {
  if (a === b) return true;
  const minLen = Math.min(a.length, b.length);
  const maxLen = Math.max(a.length, b.length);
  if (minLen < 4) return false;
  const maxEdits = maxLen >= 7 ? 2 : 1;
  if (Math.abs(a.length - b.length) <= maxEdits && levenshteinAtMost(a, b, maxEdits)) return true;
  return minLen >= 5 && Math.abs(a.length - b.length) <= 2 && (a.startsWith(b) || b.startsWith(a));
}

export function alignLyrics({
  transcript,
  lines,
  currentIndex,
  windowWords = DEFAULT_WINDOW_WORDS,
  minConfidence = DEFAULT_MIN_CONFIDENCE,
  highConfidence = DEFAULT_HIGH_CONFIDENCE,
}: AlignOptions): AlignResult {
  const stream = buildStream(lines);
  const windowTokens = normalizeForMatch(transcript).split(' ').filter(Boolean).slice(-windowWords);
  const stay = (confidence: number): AlignResult => ({
    lineIndex: currentIndex,
    confidence,
    moved: false,
  });

  if (windowTokens.length < 2 || stream.length === 0) return stay(0);

  if (currentIndex == null) {
    const opening = search(windowTokens, stream, 0, stream.length, 'earliest', 0);
    if (!opening || opening.score < minConfidence) return stay(opening?.score ?? 0);
    return { lineIndex: opening.endLine, confidence: opening.score, moved: true };
  }

  const anchor = findAnchor(stream, currentIndex);
  const local = search(
    windowTokens,
    stream,
    Math.max(0, anchor - LOCAL_BACK_TOKENS),
    Math.min(stream.length, anchor + LOCAL_FORWARD_TOKENS),
    'forward',
    anchor,
  );
  const global = search(windowTokens, stream, 0, stream.length, 'forward', anchor);
  const localScore = local?.score ?? 0;
  const globalScore = global?.score ?? 0;
  const localStrong = !!local && local.score >= minConfidence;
  const globalStrong = !!global && global.score >= highConfidence;
  // Prefer a strong match near/after the current line. A distant copy (another chorus)
  // wins only when it is clearly more confident than the neighborhood.
  const globalWorthJump = !!global
    && globalStrong
    && global.endLine !== local?.endLine
    && global.score >= localScore + JUMP_MARGIN;

  let chosen: ScoredMatch | null = null;
  if (localStrong && !globalWorthJump) chosen = local;
  else if (globalWorthJump || (globalStrong && !localStrong)) chosen = global;

  if (!chosen || chosen.score < minConfidence) return stay(Math.max(localScore, globalScore));
  if (chosen.endLine === currentIndex) return stay(chosen.score);
  return { lineIndex: chosen.endLine, confidence: chosen.score, moved: true };
}

/** Each snapshot is the transcript the recognizer currently exposes (it grows, and may reset). */
export function followTranscript(
  snapshots: string[],
  lines: string[],
  options?: Partial<Omit<AlignOptions, 'transcript' | 'lines' | 'currentIndex'>>,
): AlignResult[] {
  let currentIndex: number | null = null;
  return snapshots.map((transcript) => {
    const result = alignLyrics({ ...options, transcript, lines, currentIndex });
    currentIndex = result.lineIndex;
    return result;
  });
}

function buildStream(lines: string[]): TokenRef[] {
  const stream: TokenRef[] = [];
  lines.forEach((line, lineIndex) => {
    if (isIgnorableLyricLine(line)) return;
    for (const token of normalizeForMatch(line).split(' ')) {
      if (token) stream.push({ lineIndex, token });
    }
  });
  return stream;
}

function findAnchor(stream: TokenRef[], currentIndex: number): number {
  const exact = stream.findIndex((token) => token.lineIndex === currentIndex);
  if (exact >= 0) return exact;
  const after = stream.findIndex((token) => token.lineIndex > currentIndex);
  return after >= 0 ? after : Math.max(0, stream.length - 1);
}

function search(
  windowTokens: string[],
  stream: TokenRef[],
  start: number,
  end: number,
  mode: 'earliest' | 'forward',
  anchor: number,
): ScoredMatch | null {
  let best: ScoredMatch | null = null;
  const lastStart = Math.min(stream.length, Math.max(start, end));
  for (let index = start; index < lastStart; index++) {
    const scored = scoreAt(windowTokens, stream, index);
    if (!scored) continue;
    if (!best || isBetter(scored, best, mode, anchor)) best = scored;
  }
  return best;
}

function isBetter(
  candidate: ScoredMatch,
  best: ScoredMatch,
  mode: 'earliest' | 'forward',
  anchor: number,
): boolean {
  if (candidate.score > best.score + 1e-4) return true;
  if (best.score > candidate.score + 1e-4) return false;
  if (mode === 'earliest') return candidate.endToken < best.endToken;
  const cost = (tokenIndex: number) => (
    tokenIndex >= anchor ? tokenIndex - anchor : 10_000 + (anchor - tokenIndex)
  );
  return cost(candidate.endToken) < cost(best.endToken);
}

function scoreAt(windowTokens: string[], stream: TokenRef[], start: number): ScoredMatch | null {
  const slice = stream.slice(start, start + windowTokens.length + SLICE_SLACK);
  if (slice.length === 0) return null;

  let sliceIndex = 0;
  let matched = 0;
  let informative = 0;
  let matchedWeight = 0;
  let totalWeight = 0;
  let end = 0;

  for (let wordIndex = 0; wordIndex < windowTokens.length; wordIndex++) {
    const weight = 1 + wordIndex / windowTokens.length;
    totalWeight += weight;
    const word = windowTokens[wordIndex];
    let found = -1;
    const limit = Math.min(slice.length, sliceIndex + LOOKAHEAD + 1);
    for (let cursor = sliceIndex; cursor < limit; cursor++) {
      if (fuzzyTokenEqual(word, slice[cursor].token)) {
        found = cursor;
        break;
      }
    }
    if (found >= 0) {
      matched += 1;
      matchedWeight += weight;
      end = found;
      sliceIndex = found + 1;
      if (isInformative(slice[found].token)) informative += 1;
    }
  }

  if (matched < 2 || informative < 1 || totalWeight === 0) return null;
  return {
    score: matchedWeight / totalWeight,
    endToken: start + end,
    endLine: stream[start + end].lineIndex,
  };
}

function isInformative(token: string): boolean {
  return token.length > 2 && !STOPWORDS.has(token);
}

function isTabLine(raw: string): boolean {
  return /\|[-—~xX0-9hpb/\\]{2,}/.test(raw) || /^[a-g](?:#|b)?\|/i.test(raw.trim());
}

function isChordToken(token: string): boolean {
  const lowered = token.trim().toLowerCase().replace(/♭/g, 'b').replace(/♯/g, '#');
  if (!lowered) return true;
  if (lowered === 'nc' || lowered === 'n.c.' || lowered === 'n.c' || lowered === '%') return true;
  const stripped = lowered.replace(/^[([|{]+/, '').replace(/[)\]}|.,:;*]+$/g, '');
  if (!stripped) return true;
  if (/^[x×]\d+$/.test(stripped)) return true;
  if (/^[-–—|/\\]+$/.test(stripped)) return true;
  return CHORD_PATTERN.test(stripped);
}

function levenshteinAtMost(a: string, b: string, max: number): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > max) return false;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let rowMin = current[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      current[j] = value;
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return false;
    previous = current;
  }
  return previous[b.length] <= max;
}
