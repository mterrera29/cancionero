import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEFAULT_MIN_CONFIDENCE,
  alignLyrics,
  followTranscript,
  isIgnorableLyricLine,
  normalizeForMatch,
} from './lyric-follow';

const SONG = [
  'Caminando por la vereda',
  'bajo la luna llena',
  '',
  'Y volar, volar, volar',
  'sin mirar atrás',
  '',
  'El tiempo pasa lento',
  'las horas no se van',
  '',
  '[Coro]',
  'Am        G',
  'Y volar, volar, volar',
  'sin mirar atrás',
  '',
  'Instrumental',
  'Eb|----------------|',
];

test('normalizeForMatch strips accents, case, and punctuation', () => {
  assert.equal(normalizeForMatch('¿Dónde está el corazón que amé?'), 'donde esta el corazon que ame');
  assert.equal(normalizeForMatch("  Goin'   HOME!! "), 'goin home');
});

test('matches a line ignoring accents, case, and punctuation', () => {
  const result = alignLyrics({
    transcript: 'donde esta el corazon que ame',
    lines: ['¿Dónde está el corazón que amé?'],
    currentIndex: null,
  });
  assert.equal(result.lineIndex, 0);
  assert.equal(result.moved, true);
  assert.ok(result.confidence >= DEFAULT_MIN_CONFIDENCE);
});

test('tolerates small recognition errors', () => {
  const result = alignLyrics({
    transcript: 'caminado por la bereda',
    lines: ['Caminando por la vereda'],
    currentIndex: null,
  });
  assert.equal(result.lineIndex, 0);
  assert.equal(result.moved, true);
});

test('ignores chord-only, tab, and instrumental lines', () => {
  const lines = [
    '[Intro]',
    'Am  G  E  Am',
    'F#m  C/G',
    'N.C.',
    'Eb|----------------|',
    'Instrumental',
    '(Solo)',
    "Hey Joe, where you goin' with that gun in your hand?",
  ];
  for (const line of lines.slice(0, 7)) {
    assert.equal(isIgnorableLyricLine(line), true, line);
  }
  assert.equal(isIgnorableLyricLine('Am I happy or in misery?'), false);
  assert.equal(isIgnorableLyricLine('Y volar, volar, volar'), false);

  const result = alignLyrics({
    transcript: 'hey joe where you goin with that gun in your hand',
    lines,
    currentIndex: null,
  });
  assert.equal(result.lineIndex, 7);
});

test('repeated chorus prefers the copy near the current position', () => {
  const first = alignLyrics({
    transcript: 'y volar volar volar',
    lines: SONG,
    currentIndex: null,
  });
  assert.equal(first.lineIndex, 3);

  const second = alignLyrics({
    transcript: 'y volar volar volar',
    lines: SONG,
    currentIndex: 7,
  });
  assert.equal(second.lineIndex, 11);
  assert.equal(second.moved, true);

  const stayOnSecond = alignLyrics({
    transcript: 'y volar volar volar',
    lines: SONG,
    currentIndex: 11,
  });
  assert.equal(stayOnSecond.lineIndex, 11);
  assert.equal(stayOnSecond.moved, false);
});

test('high confidence can jump backward or far forward', () => {
  const back = alignLyrics({
    transcript: 'caminando por la vereda',
    lines: SONG,
    currentIndex: 11,
  });
  assert.equal(back.lineIndex, 0);
  assert.equal(back.moved, true);
  assert.ok(back.confidence >= 0.84);

  const filler = Array.from({ length: 18 }, (_, index) => `palabras unicas ${index} alfa bravo`);
  const longSong = ['Caminando por la vereda', ...filler, 'El cóndor pasa sobre el valle'];
  const forward = alignLyrics({
    transcript: 'el condor pasa sobre el valle',
    lines: longSong,
    currentIndex: 0,
  });
  assert.equal(forward.lineIndex, 1 + filler.length);
  assert.equal(forward.moved, true);
});

test('low confidence does not move', () => {
  const vague = alignLyrics({
    transcript: 'eh um la',
    lines: SONG,
    currentIndex: 7,
  });
  assert.equal(vague.moved, false);
  assert.equal(vague.lineIndex, 7);
  assert.ok(vague.confidence < DEFAULT_MIN_CONFIDENCE);

  const weakOverlap = alignLyrics({
    transcript: 'la la la',
    lines: SONG,
    currentIndex: 11,
  });
  assert.equal(weakOverlap.moved, false);
  assert.equal(weakOverlap.lineIndex, 11);
});

test('unrelated noise does not move the position', () => {
  const noise = alignLyrics({
    transcript: 'microondas partido zapato bicicleta',
    lines: SONG,
    currentIndex: 1,
  });
  assert.equal(noise.moved, false);
  assert.equal(noise.lineIndex, 1);
  assert.ok(noise.confidence < DEFAULT_MIN_CONFIDENCE);

  const anchored = alignLyrics({
    transcript: 'caminando por la vereda bajo la luna llena microondas partido zapato',
    lines: SONG,
    currentIndex: 1,
  });
  assert.equal(anchored.lineIndex, 1);
  assert.equal(anchored.moved, false);
});

test('simulated transcript stream follows a song through a repeated chorus', () => {
  const phrases = [
    'caminando por la vereda',
    'bajo la luna llena',
    'y volar volar volar',
    'sin mirar atras',
    'el tiempo pasa lento',
    'las horas no se van',
    'y volar volar volar',
    'sin mirar atras',
  ];
  const expected = [0, 1, 3, 4, 6, 7, 11, 12];
  let accumulated = '';
  const snapshots = phrases.map((phrase) => {
    accumulated = `${accumulated} ${phrase}`.trim();
    return accumulated;
  });

  const results = followTranscript(snapshots, SONG);
  assert.deepEqual(results.map((result) => result.lineIndex), expected);
  assert.ok(results.every((result, index) => index === 0 || result.lineIndex !== 3 || expected[index] === 3));

  // After a recognizer restart the buffer only has the new phrase, not the whole song.
  const restarted = followTranscript(
    ['el tiempo pasa lento', 'el tiempo pasa lento las horas no se van', 'y volar volar volar'],
    SONG,
  );
  assert.deepEqual(restarted.map((result) => result.lineIndex), [6, 7, 11]);
});
