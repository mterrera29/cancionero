'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Song } from '@/types';
import Spinner from './Spinner';

interface NewSongFormProps {
  userId: string;
  onClose: () => void;
  onSuccess?: () => void;
  editSong?: Song;
  initialData?: { title?: string; artist?: string; lyrics?: string; chords?: string; cover?: string };
}

export default function NewSongForm({ userId, onClose, onSuccess, editSong, initialData }: NewSongFormProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState<'lyrics' | 'chords' | null>(null);

  // Estado inicial con valores por defecto
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    cover: '',
    lyrics: '',
    chords: '',
  });

  // Sincronizar formData cuando editSong o initialData cambien
  useEffect(() => {
    if (editSong) {
      // Si estamos editando, usamos TODOS los campos de editSong
      setFormData({
        title: editSong.title || '',
        artist: editSong.artist || '',
        genre: editSong.genre || '',
        cover: editSong.cover || '',
        lyrics: editSong.lyrics || '',
        chords: editSong.chords || '',
      });
    } else if (initialData) {
      // Si es una nueva canción con datos iniciales, actualizamos solo los campos que vengan
      setFormData(prev => ({
        ...prev,
        title: initialData.title || prev.title,
        artist: initialData.artist || prev.artist,
        cover: initialData.cover || prev.cover,
        lyrics: initialData.lyrics || prev.lyrics,
        chords: initialData.chords || prev.chords,
      }));
    }
  }, [editSong, initialData]);

  const fetchMissing = async (mode: 'lyrics' | 'chords') => {
    setFetching(mode);
    try {
      const res = await fetch('/api/google-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title, artist: formData.artist, search_mode: mode }),
      });
      const data = await res.json();
      const field = mode === 'lyrics' ? 'lyrics' : 'chords';
      if (data[field]) {
        setFormData(prev => ({ ...prev, [field]: data[field] }));
      }
    } finally {
      setFetching(null);
    }
  };

  return (
     <form onSubmit={async (e) => {
       e.preventDefault();
       setLoading(true);
       try {
         const songId = editSong?.id || crypto.randomUUID();
         const method = editSong ? 'PUT' : 'POST';
         const endpoint = editSong ? `${userId}/${editSong.id}` : userId;
         // Validar que los campos requeridos no estén vacíos
     if (!formData.title || !formData.artist) {
       console.error('Título y artista son obligatorios');
       return;
     }

     console.log('Enviando datos:', { ...formData, id: songId }); // Debug
     const res = await fetch(`/api/songs/${endpoint}`, {
       method,
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         id: songId,
         userId, // Asegurar que el userId se envíe
         title: formData.title,
         artist: formData.artist,
         genre: formData.genre || null, // Si no hay género, enviar null
         cover: formData.cover || null, // Si no hay portada, enviar null
         lyrics: formData.lyrics || '', // Si no hay letra, enviar string vacío
         chords: formData.chords || '', // Si no hay acordes, enviar string vacío
       }),
     });

     if (!res.ok) {
       const errorData = await res.json();
       console.error('Error al guardar:', errorData); // Debug
       throw new Error(errorData.error || 'Error saving');
     }
         onSuccess?.();
         onClose();
       } catch (error) {
         console.error(error);
       } finally {
         setLoading(false);
       }
     }} className="space-y-5">
       {editSong && (
         <div className="text-sm font-medium px-4 py-2.5 rounded-xl" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
           Editando: <span className="text-purple-pastel">{editSong.title}</span>
         </div>
       )}

       {/* Título */}
       <div>
         <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Título</label>
         <input
           type="text"
           value={formData.title}
           onChange={(e) => setFormData({ ...formData, title: e.target.value })}
           className="w-full rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple/50 transition-all"
           style={{ 
             background: 'var(--input-bg)', 
             border: '1px solid var(--border-color)',
             color: 'var(--text-primary)',
           }}
           placeholder="Nombre de la canción"
           required
         />
       </div>

       {/* Artista y Género */}
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div>
           <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Artista</label>
           <input
             type="text"
             value={formData.artist}
             onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
             className="w-full rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple/50 transition-all"
             style={{ 
               background: 'var(--input-bg)', 
               border: '1px solid var(--border-color)',
               color: 'var(--text-primary)',
             }}
             placeholder="Nombre del artista"
             required
           />
         </div>
         <div>
           <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Género</label>
           <select
             value={formData.genre}
             onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
             className="w-full rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple/50 transition-all appearance-none"
             style={{ 
               background: 'var(--input-bg)', 
               border: '1px solid var(--border-color)',
               color: 'var(--text-primary)',
             }}
           >
             <option value="" style={{ background: 'var(--bg-card)' }}>Ninguno</option>
             {['Rock', 'Pop', 'Jazz', 'Blues', 'Folk', 'Country', 'Metal', 'Reggae', 'Clásica', 'Otro'].map(g => (
               <option key={g} value={g} style={{ background: 'var(--bg-card)' }}>{g}</option>
             ))}
           </select>
         </div>
       </div>

       {/* Portada (si existe) */}
       {formData.cover && (
         <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
           <img src={formData.cover} alt="Portada" className="w-14 h-14 rounded-lg object-cover" />
           <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Portada de Spotify</span>
         </div>
       )}

        {/* Letra */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Letra</label>
            {formData.chords && !formData.lyrics && formData.title && formData.artist && (
              <button
                type="button"
                onClick={() => fetchMissing('lyrics')}
                disabled={!!fetching}
                className="text-xs text-purple hover:text-purple-light transition-colors flex items-center gap-1 font-medium"
              >
                {fetching === 'lyrics' ? <Spinner size="sm" inline /> : '+ Buscar letra'}
              </button>
            )}
          </div>
          <textarea
           value={formData.lyrics}
           onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
           className="w-full rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple/50 transition-all min-h-[140px] resize-none"
           style={{ 
             background: 'var(--input-bg)', 
             border: '1px solid var(--border-color)',
             color: 'var(--text-primary)',
           }}
           placeholder="Escribe la letra aquí..."
         />
       </div>

        {/* Acordes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Acordes</label>
            {formData.lyrics && !formData.chords && formData.title && formData.artist && (
              <button
                type="button"
                onClick={() => fetchMissing('chords')}
                disabled={!!fetching}
                className="text-xs text-purple hover:text-purple-light transition-colors flex items-center gap-1 font-medium"
              >
                {fetching === 'chords' ? <Spinner size="sm" inline /> : '+ Buscar acordes'}
              </button>
            )}
          </div>
          <textarea
           value={formData.chords}
           onChange={(e) => setFormData({ ...formData, chords: e.target.value })}
           className="w-full rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple/50 transition-all min-h-[100px] resize-none"
           style={{ 
             background: 'var(--input-bg)', 
             border: '1px solid var(--border-color)',
             color: 'var(--text-primary)',
           }}
           placeholder="Acordes y tablatura..."
         />
       </div>

       {/* Botones */}
       <div className="flex flex-col sm:flex-row gap-3 pt-2">
         <button
           type="submit"
           disabled={loading}
           className="flex-1 flex items-center justify-center gap-2 bg-purple hover:bg-purple-light text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
         >
           {loading ? (
              <><Spinner size="sm" inline /> Guardando...</>
           ) : (
             <><Save className="w-4 h-4" /> Guardar</>
           )}
         </button>
         <button
           type="button"
           onClick={onClose}
           className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-transparent text-purple-pastel hover:bg-purple/10 transition-colors font-semibold"
         >
           Cancelar
         </button>
       </div>
    </form>
  );
}