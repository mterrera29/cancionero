'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Square, Plus, Minus, Save, AlignLeft, Columns } from 'lucide-react';

interface SongPlayerBarProps {
  fontSizeLyrics: number;
  fontSizeChords: number;
  setFontSizeLyrics: (n: number) => void;
  setFontSizeChords: (n: number) => void;
  lineHeight: number;
  setLineHeight: (n: number) => void;
  columns: number;
  setColumns: (n: number) => void;
  scrollSpeed: number;
  setScrollSpeed: (n: number) => void;
  delayTime: number;
  setDelayTime: (n: number) => void;
  activeTab: string;
  onSave: () => void;
}

export default function SongPlayerBar({
  fontSizeLyrics, fontSizeChords, setFontSizeLyrics, setFontSizeChords, lineHeight, setLineHeight,
  columns, setColumns,
  scrollSpeed, setScrollSpeed, delayTime, setDelayTime, activeTab, onSave,
}: SongPlayerBarProps) {
  const minSpeed = 0.1;
  const maxSpeed = 1;

  const [isScrolling, setIsScrolling] = useState(false);
  const [progress, setProgress] = useState(0);

  const scrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accRef = useRef(0);
  const scrollSpeedRef = useRef(scrollSpeed);
  const delayTimeRef = useRef(delayTime);

  scrollSpeedRef.current = scrollSpeed;
  delayTimeRef.current = delayTime;

  const stopAll = () => {
    setIsScrolling(false);
    if (scrollRef.current) { clearInterval(scrollRef.current); scrollRef.current = null; }
    if (delayRef.current) { clearInterval(delayRef.current); delayRef.current = null; }
    accRef.current = 0;
    setProgress(0);
  };

  const startScroll = () => {
    setIsScrolling(true);
    setProgress(0);
    let elapsed = 0;
    delayRef.current = setInterval(() => {
      elapsed += 0.05;
      const p = Math.min(elapsed / delayTimeRef.current, 1);
      setProgress(p);
      if (elapsed >= delayTimeRef.current) {
        if (delayRef.current) { clearInterval(delayRef.current); delayRef.current = null; }
        setProgress(1);
        accRef.current = 0;
        scrollRef.current = setInterval(() => {
          accRef.current += scrollSpeedRef.current;
          if (accRef.current >= 1) {
            const amount = Math.floor(accRef.current);
            window.scrollBy(0, amount);
            accRef.current -= amount;
          }
          if (window.innerHeight + window.scrollY >= document.body.offsetHeight) stopAll();
        }, 50);
      }
    }, 50);
  };

  useEffect(() => () => stopAll(), []);

  const currentFontSize = activeTab === 'lyrics' ? fontSizeLyrics : fontSizeChords;
  const setCurrentFontSize = activeTab === 'lyrics' ? setFontSizeLyrics : setFontSizeChords;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl" style={{ background: 'var(--header-bg)', borderTop: '1px solid var(--border-color)' }}>
      <div className="h-1 w-full" style={{ background: 'var(--border-color)' }}>
        <div className="h-full bg-purple transition-[width] duration-[50ms] linear" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="flex items-center justify-center gap-3 px-4 py-2 max-w-3xl mx-auto">
        <button
          onClick={() => { isScrolling ? stopAll() : startScroll(); }}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple hover:bg-purple-light transition-colors"
        >
          {isScrolling ? <Square className="w-4 h-4 text-white" fill="white" /> : <Play className="w-4 h-4 text-white" fill="white" />}
        </button>

        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span className="w-6 text-center">{scrollSpeed.toFixed(1)}x</span>
          <input type="range" min={minSpeed} max={maxSpeed} step={0.05} value={scrollSpeed}
            onChange={e => setScrollSpeed(Number(e.target.value))}
            className="w-20 md:w-28 h-1 accent-purple cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span className="w-6 text-center">{delayTime}s</span>
          <input type="range" min={0} max={60} step={1} value={delayTime}
            onChange={e => setDelayTime(Number(e.target.value))}
            className="w-16 md:w-24 h-1 accent-purple cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentFontSize(Math.min(currentFontSize + 2, 32))} className="p-1.5 rounded-lg hover:bg-purple/20 transition-colors">
            <Plus className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <span className="text-xs w-8 text-center" style={{ color: 'var(--text-secondary)' }}>{currentFontSize}px</span>
          <button onClick={() => setCurrentFontSize(Math.max(currentFontSize - 2, 12))} className="p-1.5 rounded-lg hover:bg-purple/20 transition-colors">
            <Minus className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <div className="w-px h-6" style={{ background: 'var(--border-color)' }} />

        <div className="flex items-center gap-1">
          <AlignLeft className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <button onClick={() => setLineHeight(Math.min(lineHeight + 0.2, 3))} className="p-1.5 rounded-lg hover:bg-purple/20 transition-colors">
            <Plus className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <span className="text-xs w-7 text-center" style={{ color: 'var(--text-secondary)' }}>{lineHeight.toFixed(1)}</span>
          <button onClick={() => setLineHeight(Math.max(lineHeight - 0.2, 1))} className="p-1.5 rounded-lg hover:bg-purple/20 transition-colors">
            <Minus className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <div className="w-px h-6" style={{ background: 'var(--border-color)' }} />

        <div className="flex items-center gap-1">
          <button
            onClick={() => setColumns(columns === 3 ? 1 : columns + 1)}
            className="p-1.5 rounded-lg hover:bg-purple/20 transition-colors relative"
            title={`${columns} columna${columns > 1 ? 's' : ''}`}
          >
            <Columns className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
            <span className="absolute -top-1 -right-1 text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>
              {columns}
            </span>
          </button>
        </div>

        <button onClick={onSave} className="p-1.5 rounded-lg hover:bg-purple/20 transition-colors">
          <Save className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>
    </div>
  );
}