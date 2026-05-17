import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { lists, listSongs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string; listId: string; songId: string }> }) {
  try {
    const { userId, listId, songId } = await params;

    const listResult = await db.select().from(lists).where(and(eq(lists.id, listId), eq(lists.userId, userId))).limit(1);
    if (!listResult.length) return NextResponse.json({ message: 'Lista no encontrada' }, { status: 404 });

    await db.delete(listSongs).where(and(eq(listSongs.listId, listId), eq(listSongs.songId, songId)));

    const ls = await db.select().from(listSongs).where(eq(listSongs.listId, listId));
    const songIds = ls.map(l => l.songId);

    return NextResponse.json({ message: 'Canción eliminada de la lista', list: { ...listResult[0], songIds } });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
