'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, ListMusic, Trash2 } from 'lucide-react';
import { SongListSkeleton } from '@/components/Skeleton';
import Modal from '@/components/Modal';
import { CoffeeCup, Campfire } from '@/components/IconsCozy';
import { useAuth } from '@/hooks/useAuth';

export default function ListsPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');

  const loadLists = useCallback(async () => {
    if (!userId) return;
    try {
      const r = await globalThis.fetch(`/api/lists/${userId}`);
      if (r.ok) setLists(await r.json());
    } catch {} finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { loadLists(); }, [loadLists]);

  return (
    <main className="min-h-screen pb-16">
      <div className="sticky top-0 z-40 border-b border-terracotta/20 bg-charcoal/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-warm-tan hover:text-dusty-rose transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <button onClick={() => setShowModal(true)} className="btn-cozy flex items-center gap-2 bg-warm-tan hover:bg-dusty-rose text-charcoal font-medium px-4 py-2 text-sm transition-all">
            <Plus className="w-4 h-4 animate-cozy-bounce" /> Nueva Lista
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-heading text-warm-tan mb-8">Mis Listas</h1>

        {loading ? <SongListSkeleton /> : lists.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <Campfire className="w-20 h-20 mx-auto mb-3 animate-float" />
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>No tenés listas todavía</p>
            <button onClick={() => setShowModal(true)} className="btn-cozy bg-warm-tan hover:bg-dusty-rose text-charcoal px-5 py-2.5 transition-all">Crear primera</button>
          </div>
        ) : (
          <div className="space-y-3">
            {lists.map((list, i) => (
              <div key={list.id} className={`flex items-center justify-between p-4 rounded-2xl border border-terracotta/10 bg-charcoal/30 hover:bg-terracotta/10 transition-all cursor-pointer animate-enter stagger-${Math.min(i + 1, 8)}`} onClick={() => router.push(`/lists/${list.id}`)}>
                <div>
                  <p className="text-warm-tan font-medium">{list.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{list.songIds.length} canciones</p>
                </div>
                <button onClick={e => { e.stopPropagation(); globalThis.fetch(`/api/lists/${userId}/${list.id}`, { method: 'DELETE' }).then(() => setLists(l => l.filter(x => x.id !== list.id))); }} className="p-2 rounded-xl hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6">
          <h2 className="text-lg font-bold text-warm-tan mb-6">Nueva Lista</h2>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Nombre de la lista" className="w-full bg-charcoal/80 border border-terracotta/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/35 focus:outline-none focus:border-terracotta-light transition-colors mb-5" onKeyDown={e => e.key === 'Enter' && (async () => { if (!name.trim()) return; await globalThis.fetch(`/api/lists/${userId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: crypto.randomUUID(), name: name.trim() }) }); setShowModal(false); setName(''); loadLists(); })()} />
          <div className="flex gap-3">
            <button onClick={async () => { if (!name.trim()) return; await globalThis.fetch(`/api/lists/${userId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: crypto.randomUUID(), name: name.trim() }) }); setShowModal(false); setName(''); loadLists(); }} className="btn-cozy flex-1 bg-warm-tan hover:bg-dusty-rose text-charcoal font-medium px-5 py-3 transition-all">Crear</button>
            <button onClick={() => setShowModal(false)} className="btn-cozy px-6 py-3 border border-terracotta/30 text-warm-tan hover:bg-terracotta/20 transition-colors">Cancelar</button>
          </div>
        </div>
      </Modal>
    </main>
  );
}