import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { songs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string; songId: string }> }) {
  try {
    const { userId, songId } = await params;
    const result = await db.select().from(songs).where(and(eq(songs.id, songId), eq(songs.userId, userId))).limit(1);
    if (!result.length) return NextResponse.json({ message: 'Canción no encontrada' }, { status: 404 });
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ userId: string; songId: string }> }) {
  try {
    const { userId, songId } = await params;
    const body = await request.json();
    const result = await db.update(songs).set(body).where(and(eq(songs.id, songId), eq(songs.userId, userId))).returning();
    if (!result.length) return NextResponse.json({ message: 'Canción no encontrada' }, { status: 404 });
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string; songId: string }> }) {
  try {
    const { userId, songId } = await params;
    const result = await db.delete(songs).where(and(eq(songs.id, songId), eq(songs.userId, userId))).returning();
    if (!result.length) return NextResponse.json({ message: 'Canción no encontrada' }, { status: 404 });
    return NextResponse.json({ message: 'Canción eliminada' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
