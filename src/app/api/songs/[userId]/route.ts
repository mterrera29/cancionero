import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { songs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireOwnership } from '@/lib/firebase-admin';

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const result = await db.select().from(songs).where(eq(songs.userId, userId));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const decoded = await requireOwnership(request, userId);
    const body = await request.json();
    const song = {
      ...body,
      userId,
      genre: body.genre || 'Otro',
      cover: body.cover || '',
      displayName: decoded.name,
    };
    await db.insert(songs).values(song);
    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
