'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { alignLyrics } from '@/lib/lyric-follow';
import {
  SPEECH_DENIED_MESSAGE,
  SPEECH_INSECURE_MESSAGE,
  SPEECH_UNSUPPORTED_MESSAGE,
  messageForSpeechError,
  shouldRestartAfterSpeechError,
} from '@/lib/speech-follow';

const USER_SCROLL_HOLD_MS = 2800;
const RESTART_DELAY_MS = 350;

interface SpeechAlternative {
  transcript?: string;
}

interface SpeechResultLike {
  isFinal: boolean;
  0?: SpeechAlternative;
}

interface SpeechResultEventLike {
  results: ArrayLike<SpeechResultLike>;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechResultEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}

type SpeechCtor = new () => BrowserSpeechRecognition;

function getSpeechCtor(): SpeechCtor | null {
  if (typeof window === 'undefined') return null;
  const host = window as Window & {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

function transcriptFromEvent(event: SpeechResultEventLike): string {
  const parts: string[] = [];
  for (let index = 0; index < event.results.length; index++) {
    const piece = event.results[index]?.[0]?.transcript;
    if (piece) parts.push(piece);
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

export function useLyricAudioFollow(text: string, lang: string) {
  const [listening, setListening] = useState(false);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lineIndex, setLineIndex] = useState<number | null>(null);
  const [frozenLine, setFrozenLine] = useState<number | null>(null);
  const [trackedText, setTrackedText] = useState(text);

  const textRef = useRef(text);
  const langRef = useRef(lang);
  const activeRef = useRef(false);
  const pausedRef = useRef(false);
  const currentRef = useRef<number | null>(null);
  const lineIndexRef = useRef<number | null>(null);
  const recRef = useRef<BrowserSpeechRecognition | null>(null);
  const restartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastErrorRef = useRef<string | null>(null);
  const openSessionRef = useRef<(Ctor: SpeechCtor) => void>(() => {});
  const skipRestart = useRef(true);

  if (text !== trackedText) {
    setTrackedText(text);
    setLineIndex(null);
    setFrozenLine(null);
  }

  const following = listening && !paused && !held;
  const shownLine = !listening ? null : following ? lineIndex : frozenLine;

  const openSession = useCallback((Ctor: SpeechCtor) => {
    if (restartTimer.current) {
      clearTimeout(restartTimer.current);
      restartTimer.current = null;
    }
    const previous = recRef.current;
    if (previous) {
      previous.onend = null;
      previous.onerror = null;
      previous.onresult = null;
      try { previous.abort(); } catch { /* already stopped */ }
    }

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = langRef.current || 'es-AR';

    rec.onresult = (event) => {
      lastErrorRef.current = null;
      const transcript = transcriptFromEvent(event);
      if (!transcript) return;
      const result = alignLyrics({
        transcript,
        lines: textRef.current.split('\n'),
        currentIndex: currentRef.current,
      });
      if (result.moved && result.lineIndex != null) {
        currentRef.current = result.lineIndex;
        lineIndexRef.current = result.lineIndex;
        setLineIndex(result.lineIndex);
      }
    };

    rec.onerror = (event) => {
      lastErrorRef.current = event.error;
      if (shouldRestartAfterSpeechError(event.error)) return;
      activeRef.current = false;
      setListening(false);
      setError(messageForSpeechError(event.error));
    };

    rec.onend = () => {
      if (!activeRef.current) return;
      const delay = lastErrorRef.current === 'network' ? 1200 : RESTART_DELAY_MS;
      restartTimer.current = setTimeout(() => {
        if (!activeRef.current) return;
        try {
          rec.start();
        } catch {
          openSessionRef.current(Ctor);
        }
      }, delay);
    };

    recRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      activeRef.current = false;
      setListening(false);
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError') setError(SPEECH_DENIED_MESSAGE);
      else if (name === 'SecurityError') setError(SPEECH_INSECURE_MESSAGE);
      else setError(SPEECH_UNSUPPORTED_MESSAGE);
    }
  }, []);

  useEffect(() => {
    textRef.current = text;
    currentRef.current = null;
    lineIndexRef.current = null;
  }, [text]);

  useEffect(() => {
    langRef.current = lang || 'es-AR';
  }, [lang]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    openSessionRef.current = openSession;
  }, [openSession]);

  useEffect(() => {
    if (skipRestart.current) {
      skipRestart.current = false;
      return;
    }
    if (!activeRef.current) return;
    const Ctor = getSpeechCtor();
    if (Ctor) openSessionRef.current(Ctor);
  }, [text, lang]);

  useEffect(() => () => {
    activeRef.current = false;
    if (restartTimer.current) clearTimeout(restartTimer.current);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    const rec = recRef.current;
    recRef.current = null;
    if (!rec) return;
    rec.onend = null;
    rec.onerror = null;
    rec.onresult = null;
    try { rec.abort(); } catch { /* ignore */ }
  }, []);

  const stop = useCallback(() => {
    activeRef.current = false;
    if (restartTimer.current) clearTimeout(restartTimer.current);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    const rec = recRef.current;
    recRef.current = null;
    if (rec) {
      rec.onend = null;
      rec.onerror = null;
      rec.onresult = null;
      try { rec.abort(); } catch { /* ignore */ }
    }
    currentRef.current = null;
    lineIndexRef.current = null;
    setLineIndex(null);
    setFrozenLine(null);
    setListening(false);
    setPaused(false);
    setHeld(false);
    setError(null);
  }, []);

  const toggleListening = useCallback(() => {
    if (activeRef.current) {
      stop();
      return;
    }
    const Ctor = getSpeechCtor();
    if (!Ctor) {
      setError(SPEECH_UNSUPPORTED_MESSAGE);
      return;
    }
    setError(null);
    setPaused(false);
    setHeld(false);
    activeRef.current = true;
    setListening(true);
    openSession(Ctor);
  }, [openSession, stop]);

  const togglePaused = useCallback(() => {
    if (!activeRef.current) return;
    setPaused((value) => !value);
    setFrozenLine(lineIndexRef.current);
    setHeld(false);
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  const holdBriefly = useCallback(() => {
    if (!activeRef.current || pausedRef.current) return;
    setFrozenLine(lineIndexRef.current);
    setHeld(true);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      holdTimer.current = null;
      setHeld(false);
    }, USER_SCROLL_HOLD_MS);
  }, []);

  return {
    listening,
    paused,
    held,
    following,
    error,
    lineIndex: shownLine,
    toggleListening,
    togglePaused,
    holdBriefly,
  };
}
