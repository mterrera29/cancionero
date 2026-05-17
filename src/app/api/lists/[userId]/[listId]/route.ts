import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { lists, listSongs, songs } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string; listId: string }> }) {
  try {
    const { userId, listId } = await params;
    const result = await db.select().from(lists).where(and(eq(lists.id, listId), eq(lists.userId, userId))).limit(1);
    if (!result.length) return NextResponse.json({ message: 'Lista no encontrada' }, { status: 404 });

    const list = result[0];
    const ls = await db.select().from(listSongs).where(eq(listSongs.listId, listId));
    const songIds = ls.map(l => l.songId);

    let listSongsData: typeof songs.$inferSelect[] = [];
    if (songIds.length > 0) {
      listSongsData = await db.select().from(songs).where(inArray(songs.id, songIds));
    }

    return NextResponse.json({ list: { ...list, songIds }, songs: listSongsData });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string; listId: string }> }) {
  try {
    const { userId, listId } = await params;
    await db.delete(listSongs).where(eq(listSongs.listId, listId));
    const result = await db.delete(lists).where(and(eq(lists.id, listId), eq(lists.userId, userId))).returning();
    if (!result.length) return NextResponse.json({ message: 'Lista no encontrada' }, { status: 404 });
    return NextResponse.json({ message: 'Lista eliminada' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
