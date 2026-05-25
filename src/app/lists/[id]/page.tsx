'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Music, Trash2, Plus } from 'lucide-react';
import Spinner from '@/components/Spinner';
import Modal from '@/components/Modal';
import { useAuth } from '@/hooks/useAuth';

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userId, getToken } = useAuth();
  const [list, setList] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [allSongs, setAllSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const token = await getToken();
      const headers: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      const [listData, songsData] = await Promise.all([
        fetch(`/api/lists/${userId}/${params.id}`).then(r => r.ok ? r.json() : null),
        fetch(`/api/songs/${userId}`, { headers }).then(r => r.ok ? r.json() : []),
      ]);
      if (listData) {
        setList(listData.list);
        setSongs(listData.songs || []);
      }
      setAllSongs(Array.isArray(songsData) ? songsData : []);
      setLoading(false);
    })();
  }, [params.id, userId, getToken]);

  if (loading) return <Spinner />;

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <Music className="w-14 h-14 mx-auto text-white/20 mb-4" />
          <p className="text-white/50 text-lg mb-4">Lista no encontrada</p>
          <button onClick={() => router.push('/lists')} className="bg-purple hover:bg-purple-light text-white px-6 py-2.5 rounded-xl transition-all">Volver</button>
        </div>
      </div>
    );
  }

  const available = allSongs.filter(s => !list.songIds.includes(s.id));

  return (
    <main className="min-h-screen pb-16">
      <div className="sticky top-0 z-40 border-b border-purple/20 bg-[#2d1b4e]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push('/lists')} className="flex items-center gap-2 text-sm text-purple-pastel hover:text-pink-soft transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-purple hover:bg-purple-light text-white font-medium px-4 py-2 rounded-xl text-sm transition-all">
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-purple-pastel mb-1">{list.name}</h1>
        <p className="text-sm text-white/40 mb-8">{songs.length} canciones</p>

        {songs.length === 0 ? (
          <div className="text-center py-16">
            <Music className="w-12 h-12 mx-auto text-white/20 mb-3" />
            <p className="text-white/40 mb-4">Esta lista está vacía</p>
            <button onClick={() => setShowAdd(true)} className="bg-purple hover:bg-purple-light text-white px-5 py-2.5 rounded-xl transition-all">Agregar canciones</button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {songs.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl border border-purple/10 bg-purple-dark/30 hover:bg-purple/10 transition-all cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 25}ms` }} onClick={() => router.push(`/song/${s.id}`)}>
                <div>
                  <p className="text-purple-pastel font-medium">{s.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{s.artist}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); fetch(`/api/lists/${userId}/${params.id}/removeSong/${s.id}`, { method: 'DELETE' }).then(() => setSongs(prev => prev.filter(x => x.id !== s.id))); }} className="p-2 rounded-xl hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)}>
        <div className="p-6">
          <h2 className="text-lg font-bold text-purple-pastel mb-6">Agregar a la lista</h2>
          {available.length === 0 ? (
            <p className="text-white/40 text-center py-4">No hay más canciones para agregar</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {available.map(s => (
                <button key={s.id} onClick={async () => { await fetch(`/api/lists/${userId}/${params.id}/songs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ songId: s.id }) }); setSongs(prev => [...prev, s]); setShowAdd(false); }} className="w-full flex items-center justify-between p-3.5 rounded-xl border border-purple/10 bg-purple-dark/30 hover:bg-purple/10 hover:border-purple/30 transition-all text-left">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-purple-pastel truncate">{s.title}</p>
                    <p className="text-xs text-white/40 truncate">{s.artist}</p>
                  </div>
                  <Plus className="w-4 h-4 text-purple-pastel shrink-0 ml-3" />
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </main>
  );
}