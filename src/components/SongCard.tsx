'use client';

import { useRouter } from 'next/navigation';
import { Music, Edit2, Trash2, MoreVertical, Plus } from 'lucide-react';
import { useState } from 'react';
import { Song } from '@/types';

interface SongCardProps {
  song: Song;
  userId: string;
  onDelete: (songId: string) => void;
  onEdit: (song: Song) => void;
  onAddToList?: (songId: string) => void;
  showAuthor?: boolean;
}

export default function SongCard({ song, onDelete, onEdit, onAddToList, showAuthor }: SongCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="group flex items-start justify-between p-5 rounded-2xl border border-purple/10 bg-purple-dark/40 hover:bg-purple/10 hover:border-purple/30 transition-all cursor-pointer"
      onClick={() => router.push(`/song/${song.id}`)}
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-semibold text-purple-pastel group-hover:text-pink-soft transition-colors truncate">
          {song.title}
        </h3>
        <p className="text-sm text-white/50 mt-1">{song.artist}</p>
        {showAuthor && song.displayName && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            por {song.displayName}
          </p>
        )}
        <span className="inline-block mt-2.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-purple/15 text-purple-pastel">
          {song.genre}
        </span>
      </div>

      {showAuthor ? (
        <div className="shrink-0 ml-4">
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/song/${song.id}`); }}
            className="p-2 rounded-xl bg-purple/20 hover:bg-purple/30 transition-colors"
          >
            <Music className="w-4 h-4 text-purple-pastel" />
          </button>
        </div>
      ) : (
        <div className="relative shrink-0 ml-4">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-2 rounded-xl hover:bg-purple/20 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-white/40" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 min-w-[170px] bg-[#2d1b4e] border border-purple/30 rounded-xl shadow-2xl py-1.5 z-10 animate-fade-in">
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/song/${song.id}`); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple/20 transition-colors text-left text-sm"
              >
                <Music className="w-4 h-4 text-purple-pastel" />
                <span className="text-purple-pastel">Ver detalles</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(song); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple/20 transition-colors text-left text-sm"
              >
                <Edit2 className="w-4 h-4 text-purple-pastel" />
                <span className="text-purple-pastel">Editar</span>
              </button>
              {onAddToList && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAddToList(song.id); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple/20 transition-colors text-left text-sm"
                >
                  <Plus className="w-4 h-4 text-purple-pastel" />
                  <span className="text-purple-pastel">Agregar a lista</span>
                </button>
              )}
              <hr className="border-purple/20 my-1" />
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(song.id); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-left text-sm"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span className="text-red-400">Eliminar</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}