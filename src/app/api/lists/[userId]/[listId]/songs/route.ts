import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { lists, listSongs, songs } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function POST(request: Request, { params }: { params: Promise<{ userId: string; listId: string }> }) {
  try {
    const { userId, listId } = await params;
    const { songId } = await request.json();

    const listResult = await db.select().from(lists).where(and(eq(lists.id, listId), eq(lists.userId, userId))).limit(1);
    if (!listResult.length) return NextResponse.json({ message: 'Lista no encontrada' }, { status: 404 });

    const existing = await db.select().from(listSongs).where(and(eq(listSongs.listId, listId), eq(listSongs.songId, songId))).limit(1);
    if (existing.length) return NextResponse.json({ message: 'La canción ya está en la lista' }, { status: 400 });

    await db.insert(listSongs).values({ listId, songId });
    const ls = await db.select().from(listSongs).where(eq(listSongs.listId, listId));
    const songIds = ls.map(l => l.songId);

    let listSongsData: typeof songs.$inferSelect[] = [];
    if (songIds.length > 0) {
      listSongsData = await db.select().from(songs).where(inArray(songs.id, songIds));
    }

    return NextResponse.json({ list: { ...listResult[0], songIds }, songs: listSongsData });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ userId: string; listId: string }> }) {
  try {
    const { userId, listId } = await params;
    const listResult = await db.select().from(lists).where(and(eq(lists.id, listId), eq(lists.userId, userId))).limit(1);
    if (!listResult.length) return NextResponse.json({ message: 'Lista no encontrada' }, { status: 404 });

    const ls = await db.select().from(listSongs).where(eq(listSongs.listId, listId));
    const songIds = ls.map(l => l.songId);

    let listSongsData: typeof songs.$inferSelect[] = [];
    if (songIds.length > 0) {
      listSongsData = await db.select().from(songs).where(inArray(songs.id, songIds));
    }

    return NextResponse.json({ songs: listSongsData, list: { ...listResult[0], songIds } });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
