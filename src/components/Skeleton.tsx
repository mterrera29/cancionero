'use client';

export function SongListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-10 h-10 rounded-md bg-purple/20 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-3/5 rounded bg-purple/20" />
            <div className="h-3 w-2/5 rounded bg-purple/10" />
          </div>
          <div className="h-3 w-12 rounded bg-purple/10 shrink-0 hidden sm:block" />
        </div>
      ))}
    </div>
  );
}

export function SongCardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-start justify-between p-5 rounded-2xl border border-purple/10 bg-purple-dark/40"
        >
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/5 rounded bg-purple/20" />
            <div className="h-3.5 w-2/5 rounded bg-purple/10" />
            <div className="h-5 w-16 rounded-full bg-purple/15" />
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple/10 shrink-0 ml-4" />
        </div>
      ))}
    </div>
  );
}

export function SongDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-6 pb-24 pt-20 animate-pulse">
      <div className="flex items-start gap-5 mb-8">
        <div className="w-5 h-5 rounded bg-purple/20 shrink-0 mt-1" />
        <div className="w-20 h-20 rounded-2xl bg-purple/20 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-3/5 rounded bg-purple/20" />
          <div className="h-4 w-2/5 rounded bg-purple/10" />
          <div className="h-5 w-14 rounded-full bg-purple/15" />
        </div>
      </div>
      <div className="space-y-2">
        {[65, 50, 75, 45, 80, 55, 70, 40, 85, 50, 60, 45].map((w, i) => (
          <div key={i} className="h-4 rounded" style={{ width: `${w}%`, background: 'var(--bg-card)' }} />
        ))}
      </div>
    </div>
  );
}
