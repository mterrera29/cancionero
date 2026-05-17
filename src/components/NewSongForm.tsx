'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Song } from '@/types';

interface NewSongFormProps {
  userId: string;
  onClose: () => void;
  onSuccess?: () => void;
  editSong?: Song;
  initialData?: { title?: string; artist?: string; lyrics?: string; cover?: string };
}

export default function NewSongForm({ userId, onClose, onSuccess, editSong, initialData }: NewSongFormProps) {
  const [formData, setFormData] = useState({
    title: editSong?.title || initialData?.title || '',
    artist: editSong?.artist || initialData?.artist || '',
    genre: editSong?.genre || '',
    cover: editSong?.cover || initialData?.cover || '',
    lyrics: editSong?.lyrics || initialData?.lyrics || '',
    chords: editSong?.chords || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        title: initialData.title || prev.title,
        artist: initialData.artist || prev.artist,
        cover: initialData.cover || prev.cover,
        lyrics: initialData.lyrics || prev.lyrics,
      }));
    }
  }, [initialData]);

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const songId = editSong?.id || crypto.randomUUID();
        const method = editSong ? 'PUT' : 'POST';
        const endpoint = editSong ? `${userId}/${editSong.id}` : userId;
        const res = await fetch(`/api/songs/${endpoint}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: songId }),
        });
        if (!res.ok) throw new Error('Error saving');
        onSuccess?.();
        onClose();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }} className="space-y-5">
      {editSong && (
        <div className="text-xs text-white/50 bg-purple/10 rounded-xl px-4 py-2.5">
          Editando: <span className="text-purple-pastel font-medium">{editSong.title}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-purple-pastel mb-2">Título</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-purple-dark/80 border border-purple/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/35 focus:outline-none focus:border-purple-light transition-colors"
          placeholder="Nombre de la canción"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-purple-pastel mb-2">Artista</label>
          <input
            type="text"
            value={formData.artist}
            onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
            className="w-full bg-purple-dark/80 border border-purple/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/35 focus:outline-none focus:border-purple-light transition-colors"
            placeholder="Nombre del artista"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-purple-pastel mb-2">Género</label>
          <select
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            className="w-full bg-purple-dark/80 border border-purple/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-light transition-colors"
          >
            <option value="" className="bg-[#2d1b4e] text-white/35">Ninguno</option>
            {['Rock', 'Pop', 'Jazz', 'Blues', 'Folk', 'Country', 'Metal', 'Reggae', 'Clásica', 'Otro'].map(g => (
              <option key={g} value={g} className="bg-[#2d1b4e]">{g}</option>
            ))}
          </select>
        </div>
      </div>

        {formData.cover && (
          <div className="flex items-center gap-3">
            <img src={formData.cover} alt="cover" className="w-12 h-12 rounded-lg object-cover" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tapa de Spotify encontrada</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-purple-pastel mb-2">Letra</label>
        <textarea
          value={formData.lyrics}
          onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
          className="w-full bg-purple-dark/80 border border-purple/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/35 focus:outline-none focus:border-purple-light transition-colors h-36 resize-none"
          placeholder="Escribe la letra aquí..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-purple-pastel mb-2">Acordes</label>
        <textarea
          value={formData.chords}
          onChange={(e) => setFormData({ ...formData, chords: e.target.value })}
          className="w-full bg-purple-dark/80 border border-purple/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/35 focus:outline-none focus:border-purple-light transition-colors h-28 resize-none"
          placeholder="Acordes y tablatura..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-purple hover:bg-purple-light text-white font-medium px-5 py-3 rounded-xl transition-all"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 rounded-xl border border-purple/30 text-purple-pastel hover:bg-purple/20 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}