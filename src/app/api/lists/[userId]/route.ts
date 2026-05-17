import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { lists, listSongs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const userLists = await db.select().from(lists).where(eq(lists.userId, userId)).orderBy(lists.createdAt);
    const allListSongs = await db.select().from(listSongs);
    const result = userLists.map(l => ({
      ...l,
      songIds: allListSongs.filter(ls => ls.listId === l.id).map(ls => ls.songId),
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const list = { id: body.id, userId, name: body.name };
    await db.insert(lists).values(list);
    return NextResponse.json({ ...list, songIds: [] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
