export interface Song {
  id: string;
  userId?: string;
  title: string;
  artist: string;
  genre: string;
  cover?: string;
  lyrics?: string;
  chords?: string;
  fontSizeLyrics?: number;
  fontSizeChords?: number;
  lineHeight?: number;
  scrollSpeed?: number;
  delayTime?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface List {
  id: string;
  name: string;
  songIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  image?: string;
  songs: Song[];
  lists: List[];
}

export interface SongWithMeta extends Song {
  createdAt?: string;
  updatedAt?: string;
}