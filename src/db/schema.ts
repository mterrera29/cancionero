import { pgTable, text, timestamp, integer, real, primaryKey } from 'drizzle-orm/pg-core';

export const songs = pgTable('songs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  genre: text('genre').notNull().default('Otro'),
  cover: text('cover').default(''),
  lyrics: text('lyrics').default(''),
  chords: text('chords').default(''),
  fontSizeLyrics: integer('font_size_lyrics').default(14),
  fontSizeChords: integer('font_size_chords').default(14),
  lineHeight: real('line_height').default(1),
  scrollSpeed: real('scroll_speed').default(0.3),
  delayTime: integer('delay_time').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const lists = pgTable('lists', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const listSongs = pgTable('list_songs', {
  listId: text('list_id').notNull().references(() => lists.id),
  songId: text('song_id').notNull().references(() => songs.id),
}, (t) => [primaryKey({ columns: [t.listId, t.songId] })]);
