import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { songs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireOwnership, verifyFirebaseToken } from '@/lib/firebase-admin';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;

    // Try to verify the Firebase token to determine if this is the owner
    let isOwner = false;
    try {
      const decoded = await verifyFirebaseToken(request);
      isOwner = decoded.uid === userId;
    } catch {
      // No valid token or mismatch — visitor view
    }

    if (isOwner) {
      // Owner: return ALL songs (private + public)
      const result = await db.select().from(songs).where(eq(songs.userId, userId));
      return NextResponse.json(result);
    }

    // Visitor: return ONLY public songs
    const result = await db.select().from(songs).where(
      and(eq(songs.userId, userId), eq(songs.isPublic, true))
    );
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
