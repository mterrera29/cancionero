'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Play, Music, Edit2, Trash2, MoreVertical, Plus } from 'lucide-react';
import { useState } from 'react';
import { Song } from '@/types';
import CozyCover from './CozyCover';
import { Flame } from './IconsCozy';

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
        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative cursor-pointer hover:bg-white/5"
      >
        <div className="relative shrink-0">
          {song.cover ? (
            <Image src={song.cover} alt="" width={40} height={40} className="w-10 h-10 rounded-md object-cover" />
          ) : (
            <CozyCover seed={`${song.title}-${song.artist}`} genre={song.genre} size={40} className="rounded-md" />
          )}
          <Flame className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 text-amber-400 drop-shadow-sm" />
        </div>

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
          <span className="text-[11px] shrink-0 ml-2 px-2 py-0.5 rounded-full bg-terracotta/15 text-warm-tan">
            {song.displayName}
          </span>
        )}

        <span className="text-[11px] hidden sm:block shrink-0" style={{ color: 'var(--text-muted)' }}>{song.genre}</span>
      </div>
    );
  }

  return (
    <div
      className="group card-cozy flex items-start justify-between p-5 border border-terracotta/10 bg-charcoal/40 hover:bg-terracotta/10 hover:border-terracotta/30 transition-all cursor-pointer"
      onClick={() => router.push(`/song/${song.id}`)}
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-semibold text-warm-tan group-hover:text-dusty-rose transition-colors truncate">
          {song.title}
        </h3>
        <p className="text-sm text-white/50 mt-1">{song.artist}</p>
        <span className="inline-flex items-center gap-1 mt-2.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-terracotta/15 text-warm-tan">
          <Flame className="w-3 h-3 text-amber-400" />
          {song.genre}
        </span>
      </div>

      <div className="relative shrink-0 ml-4">
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="p-2 rounded-xl hover:bg-terracotta/20 transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-white/40" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 min-w-[170px] bg-charcoal border border-terracotta/30 rounded-xl shadow-2xl py-1.5 z-10 animate-fade-in">
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/song/${song.id}`); setShowMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-terracotta/20 transition-colors text-left text-sm"
            >
              <Music className="w-4 h-4 text-warm-tan" />
              <span className="text-warm-tan">Ver detalles</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(song); setShowMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-terracotta/20 transition-colors text-left text-sm"
            >
              <Edit2 className="w-4 h-4 text-warm-tan" />
              <span className="text-warm-tan">Editar</span>
            </button>
            {onAddToList && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToList(song.id); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-terracotta/20 transition-colors text-left text-sm"
              >
                <Plus className="w-4 h-4 text-warm-tan" />
                <span className="text-warm-tan">Agregar a lista</span>
              </button>
            )}
            <hr className="border-terracotta/20 my-1" />
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