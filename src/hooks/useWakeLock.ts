'use client';

import { useEffect, useRef, useCallback } from 'react';

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const request = useCallback(async () => {
    try {
      const nav = navigator as any;
      if (nav.wakeLock?.request) {
        const lock = await nav.wakeLock.request('screen');
        wakeLockRef.current = lock;
      }
    } catch {}
  }, []);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  }, []);

  useEffect(() => {
    request();
    const handle = () => { if (document.visibilityState === 'visible') request(); };
    document.addEventListener('visibilitychange', handle);
    return () => { release(); document.removeEventListener('visibilitychange', handle); };
  }, [request, release]);

  return { requestWakeLock: request, releaseWakeLock: release };
}