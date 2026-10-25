'use client';

import { useRef, useEffect, useCallback, forwardRef } from 'react';

interface SongContentViewProps {
  lyrics?: string;
  chords?: string;
  activeTab: string;
  fontSize: number;
  lineHeight: number;
  displayMode: 'vertical' | 'horizontal';
  horizontalScrollRef?: React.Ref<HTMLDivElement>;
  activeLineIndex?: number | null;
  followScroll?: boolean;
  onUserScroll?: () => void;
}

export default function SongContentView({
  lyrics,
  chords,
  activeTab,
  fontSize,
  lineHeight,
  displayMode,
  horizontalScrollRef,
  activeLineIndex = null,
  followScroll = false,
  onUserScroll,
}: SongContentViewProps) {
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const content = activeTab === 'lyrics' ? lyrics : chords;
  const lines = content ? content.split('\n') : [];

  const registerLine = useCallback((index: number, node: HTMLDivElement | null) => {
    lineRefs.current[index] = node;
  }, []);

  const horizontalScroller = useCallback((): HTMLElement | null => {
    if (horizontalScrollRef && typeof horizontalScrollRef === 'object') return horizontalScrollRef.current;
    return null;
  }, [horizontalScrollRef]);

  useEffect(() => {
    if (!followScroll || activeLineIndex == null) return;
    const el = lineRefs.current[activeLineIndex];
    if (!el) return;
    scrollLineIntoFollowPosition(el, displayMode, displayMode === 'horizontal' ? horizontalScroller() : null);
  }, [followScroll, activeLineIndex, displayMode, content, horizontalScroller]);

  useEffect(() => {
    if (!onUserScroll) return;
    let lastGesture = 0;
    let pointerActive = false;
    const mark = () => { lastGesture = performance.now(); };
    const onKey = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
        mark();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('button, input, a, textarea, select')) return;
      pointerActive = true;
    };
    const onPointerUp = () => { pointerActive = false; };
    const onScroll = () => {
      if (pointerActive || performance.now() - lastGesture < 900) onUserScroll();
    };

    window.addEventListener('wheel', mark, { passive: true, capture: true });
    window.addEventListener('touchmove', mark, { passive: true, capture: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('scroll', onScroll, { passive: true });
    const scroller = horizontalScroller();
    scroller?.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', mark, { capture: true });
      window.removeEventListener('touchmove', mark, { capture: true });
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('scroll', onScroll);
      scroller?.removeEventListener('scroll', onScroll);
    };
  }, [onUserScroll, displayMode, content, horizontalScroller]);

  if (!content) {
    return (
      <div className="text-center py-12 text-sm italic" style={{ color: 'var(--text-muted)' }}>
        {activeTab === 'chords' ? 'No hay acordes disponibles.' : 'No hay letra disponible.'}
      </div>
    );
  }

  if (displayMode === 'vertical') {
    return (
      <div className="px-1" style={{ fontSize: `${fontSize}px`, color: 'var(--text-primary)' }}>
        {lines.map((line, i) => (
          <LyricRow
            key={i}
            line={line}
            index={i}
            active={i === activeLineIndex}
            lineHeight={lineHeight}
            zebra={i % 2 === 0 ? 'bg-white/[0.02]' : ''}
            onRegister={registerLine}
          />
        ))}
      </div>
    );
  }

  return (
    <HorizontalView
      ref={horizontalScrollRef}
      lines={lines}
      fontSize={fontSize}
      lineHeight={lineHeight}
      activeLineIndex={activeLineIndex}
      onRegister={registerLine}
    />
  );
}

function LyricRow({
  line,
  index,
  active,
  lineHeight,
  zebra,
  onRegister,
}: {
  line: string;
  index: number;
  active: boolean;
  lineHeight: number;
  zebra: string;
  onRegister: (index: number, node: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={(node) => onRegister(index, node)}
      data-lyric-line={index}
      data-lyric-active={active ? 'true' : undefined}
      aria-current={active ? 'true' : undefined}
      className={`px-3 py-1.5 rounded-lg transition-colors duration-300 break-inside-avoid ${
        active ? 'lyric-follow-line' : zebra
      }`}
      style={{
        color: line.trim() === '' ? 'transparent' : 'var(--text-primary)',
        lineHeight,
      }}
    >
      {line || '\u00A0'}
    </div>
  );
}

const HorizontalView = forwardRef<HTMLDivElement, {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  activeLineIndex: number | null;
  onRegister: (index: number, node: HTMLDivElement | null) => void;
}>(
  ({ lines, fontSize, lineHeight, activeLineIndex, onRegister }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const resize = () => {
        const parent = el.parentElement;
        if (!parent) return;
        const availableH = parent.clientHeight;
        const lineH = fontSize * lineHeight + 12;
        const itemsPerCol = Math.max(1, Math.floor(availableH / lineH));

        el.style.height = `${availableH}px`;

        if (lines.length <= itemsPerCol) {
          el.style.columnCount = '1';
          el.style.columnWidth = 'auto';
          return;
        }

        const totalCols = Math.ceil(lines.length / itemsPerCol);

        let maxW = 220;
        lines.forEach(l => {
          const w = l.length * fontSize * 0.55 + 32;
          if (w > maxW) maxW = w;
        });
        maxW = Math.min(maxW, 400);

        el.style.columnCount = String(totalCols);
        el.style.columnWidth = `${maxW}px`;
      };

      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }, [lines, fontSize, lineHeight]);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      };
      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }, []);

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className="overflow-x-auto overflow-y-hidden"
        style={{
          fontSize: `${fontSize}px`,
          color: 'var(--text-primary)',
          columnFill: 'auto',
          columnGap: '2rem',
          columnRule: '1px solid var(--border-color)',
        }}
      >
        {lines.map((line, i) => (
          <LyricRow
            key={i}
            line={line}
            index={i}
            active={i === activeLineIndex}
            lineHeight={lineHeight}
            zebra={i % 2 === 0 ? 'bg-white/[0.02]' : ''}
            onRegister={onRegister}
          />
        ))}
      </div>
    );
  }
);
HorizontalView.displayName = 'HorizontalView';

function scrollLineIntoFollowPosition(
  el: HTMLElement,
  mode: 'vertical' | 'horizontal',
  scroller: HTMLElement | null,
) {
  const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  if (mode === 'horizontal' && scroller) {
    const cRect = scroller.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    const visible = eRect.left >= cRect.left + 8
      && eRect.right <= cRect.right - 8
      && eRect.top >= cRect.top
      && eRect.bottom <= cRect.bottom;
    if (visible) return;
    const deltaX = eRect.left - (cRect.left + cRect.width * 0.12);
    scroller.scrollTo({ left: scroller.scrollLeft + deltaX, behavior });
    return;
  }

  const deltaY = el.getBoundingClientRect().top - window.innerHeight / 3;
  if (Math.abs(deltaY) < 28) return;
  window.scrollTo({ top: Math.max(0, window.scrollY + deltaY), behavior });
}
