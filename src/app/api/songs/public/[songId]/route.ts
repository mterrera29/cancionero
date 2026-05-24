import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { songs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const { songId } = await params;
    const result = await db
      .select()
      .from(songs)
      .where(and(eq(songs.id, songId), eq(songs.isPublic, true)))
      .limit(1);

    if (!result.length) {
      return NextResponse.json(
        { error: 'Canción no encontrada o no es pública' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
