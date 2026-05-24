import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { songs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireOwnership } from '@/lib/firebase-admin';

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string; songId: string }> }) {
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
    const decoded = await requireOwnership(request, userId);
    const body = await request.json();
    // Preserve existing isPublic if not provided in update
    const updateData = { ...body, displayName: decoded.name };
    const result = await db.update(songs).set(updateData).where(and(eq(songs.id, songId), eq(songs.userId, userId))).returning();
    if (!result.length) return NextResponse.json({ message: 'Canción no encontrada' }, { status: 404 });
    return NextResponse.json(result[0]);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string; songId: string }> }) {
  try {
    const { userId, songId } = await params;
    await requireOwnership(request, userId);
    const result = await db.delete(songs).where(and(eq(songs.id, songId), eq(songs.userId, userId))).returning();
    if (!result.length) return NextResponse.json({ message: 'Canción no encontrada' }, { status: 404 });
    return NextResponse.json({ message: 'Canción eliminada' });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
