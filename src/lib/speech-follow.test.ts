import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  inferRecognitionLang,
  messageForSpeechError,
  shouldRestartAfterSpeechError,
  SPEECH_DENIED_MESSAGE,
  SPEECH_NO_MIC_MESSAGE,
} from './speech-follow';

test('restarts recognition after transient errors and stops on permission or abort', () => {
  assert.equal(shouldRestartAfterSpeechError('no-speech'), true);
  assert.equal(shouldRestartAfterSpeechError('network'), true);
  assert.equal(shouldRestartAfterSpeechError('aborted'), false);
  assert.equal(shouldRestartAfterSpeechError('not-allowed'), false);
  assert.equal(shouldRestartAfterSpeechError('service-not-allowed'), false);
  assert.equal(shouldRestartAfterSpeechError('audio-capture'), false);
  assert.equal(shouldRestartAfterSpeechError('language-not-supported'), false);
});

test('permission and missing microphone have distinct Spanish messages', () => {
  assert.match(messageForSpeechError('not-allowed'), /micrófono/);
  assert.equal(messageForSpeechError('not-allowed'), SPEECH_DENIED_MESSAGE);
  assert.equal(messageForSpeechError('audio-capture'), SPEECH_NO_MIC_MESSAGE);
  assert.match(messageForSpeechError('service-not-allowed'), /HTTPS/);
});

test('recognition language defaults to es-AR and can come from the song', () => {
  assert.equal(inferRecognitionLang({}), 'es-AR');
  assert.equal(inferRecognitionLang({ lyrics: 'luna llena' }), 'es-AR');
  assert.equal(inferRecognitionLang({ language: 'es' }), 'es-AR');
  assert.equal(inferRecognitionLang({ language: 'es-MX' }), 'es-MX');
  assert.equal(inferRecognitionLang({ language: 'en' }), 'en-US');
  assert.equal(inferRecognitionLang({ language: 'pt-BR' }), 'pt-BR');
  assert.equal(inferRecognitionLang({ language: 'klingon' }), 'es-AR');

  const spanish = 'Caminando por la vereda bajo la luna que ilumina la ciudad';
  assert.equal(inferRecognitionLang({ lyrics: spanish }), 'es-AR');

  const english = 'Purple haze all in my brain Lately things just dont seem the same Excuse me while I kiss the sky';
  assert.equal(inferRecognitionLang({ lyrics: english }), 'en-US');
  assert.equal(inferRecognitionLang({ language: 'es', lyrics: english }), 'es-AR');
});
