'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Play, Music, Edit2, Trash2, MoreVertical, Plus } from 'lucide-react';
import { useState } from 'react';
import { Song } from '@/types';

const COLORS = ['#5c3e91', '#7c3aed', '#a855f7', '#8b5cf6', '#6d28d9', '#4c1d95', '#3b0764', '#701a75'];

function getColor(id: string) {
  return COLORS[parseInt(id) % COLORS.length];
}

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

  if (showAuthor) {
    return (
      <div
        onClick={() => router.push(`/song/${song.id}`)}
        className="group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative cursor-pointer hover:bg-white/5"
      >
        {song.cover ? (
          <Image src={song.cover} alt="" width={40} height={40} className="w-10 h-10 rounded-md shrink-0 object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-md shrink-0 flex items-center justify-center" style={{ background: getColor(song.id) }}>
            <Music className="w-5 h-5 text-white/70" />
          </div>
        )}

        <div className="absolute left-3 w-10 h-10 rounded-md flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={(e) => { e.stopPropagation(); router.push(`/song/${song.id}`); }}>
          <Play className="w-4 h-4 text-white" fill="white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate transition-colors group-hover:text-white"
            style={{ color: 'var(--text-primary)' }}>{song.title}</p>
          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{song.artist}</p>
        </div>

        {song.displayName && (
          <span className="text-[11px] shrink-0 ml-2 px-2 py-0.5 rounded-full bg-purple/15 text-purple-pastel">
            {song.displayName}
          </span>
        )}

        <span className="text-[11px] hidden sm:block shrink-0" style={{ color: 'var(--text-muted)' }}>{song.genre}</span>
      </div>
    );
  }

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
        <span className="inline-block mt-2.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-purple/15 text-purple-pastel">
          {song.genre}
        </span>
      </div>

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
    </div>
  );
}