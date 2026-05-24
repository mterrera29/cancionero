import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { songs } from '@/db/schema';
import { eq, or, ilike, desc, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    let query = db.select().from(songs).where(eq(songs.isPublic, true));

    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      query = db
        .select()
        .from(songs)
        .where(
          and(
            eq(songs.isPublic, true),
            or(ilike(songs.title, term), ilike(songs.artist, term))
          )
        );
    }

    const result = await query.orderBy(desc(songs.createdAt));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
