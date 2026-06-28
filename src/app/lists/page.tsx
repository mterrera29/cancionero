'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, ListMusic, Trash2 } from 'lucide-react';
import { SongListSkeleton } from '@/components/Skeleton';
import Modal from '@/components/Modal';
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
      <div className="sticky top-0 z-40 border-b border-purple/20 bg-[#2d1b4e]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-purple-pastel hover:text-pink-soft transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-purple hover:bg-purple-light text-white font-medium px-4 py-2 rounded-xl text-sm transition-all">
            <Plus className="w-4 h-4" /> Nueva Lista
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-purple-pastel mb-8">Mis Listas</h1>

        {loading ? <SongListSkeleton /> : lists.length === 0 ? (
          <div className="text-center py-16">
            <ListMusic className="w-12 h-12 mx-auto text-white/20 mb-3" />
            <p className="text-white/40 mb-4">No tenés listas todavía</p>
            <button onClick={() => setShowModal(true)} className="bg-purple hover:bg-purple-light text-white px-5 py-2.5 rounded-xl transition-all">Crear primera</button>
          </div>
        ) : (
          <div className="space-y-3">
            {lists.map((list, i) => (
              <div key={list.id} className="flex items-center justify-between p-4 rounded-2xl border border-purple/10 bg-purple-dark/30 hover:bg-purple/10 transition-all cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 30}ms` }} onClick={() => router.push(`/lists/${list.id}`)}>
                <div>
                  <p className="text-purple-pastel font-medium">{list.name}</p>
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
          <h2 className="text-lg font-bold text-purple-pastel mb-6">Nueva Lista</h2>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Nombre de la lista" className="w-full bg-purple-dark/80 border border-purple/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/35 focus:outline-none focus:border-purple-light transition-colors mb-5" onKeyDown={e => e.key === 'Enter' && (async () => { if (!name.trim()) return; await globalThis.fetch(`/api/lists/${userId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: crypto.randomUUID(), name: name.trim() }) }); setShowModal(false); setName(''); loadLists(); })()} />
          <div className="flex gap-3">
            <button onClick={async () => { if (!name.trim()) return; await globalThis.fetch(`/api/lists/${userId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: crypto.randomUUID(), name: name.trim() }) }); setShowModal(false); setName(''); loadLists(); }} className="flex-1 bg-purple hover:bg-purple-light text-white font-medium px-5 py-3 rounded-xl transition-all">Crear</button>
            <button onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl border border-purple/30 text-purple-pastel hover:bg-purple/20 transition-colors">Cancelar</button>
          </div>
        </div>
      </Modal>
    </main>
  );
}