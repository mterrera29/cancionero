import { NextResponse } from 'next/server';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;

  return accessToken;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'track';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (type === 'track') {
      const tracks = data.tracks?.items?.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists?.[0]?.name || 'Unknown',
        album: track.album?.name,
        cover: track.album?.images?.[0]?.url || null,
        preview: track.preview_url,
      })) || [];

      return NextResponse.json({ tracks });
    }

    if (type === 'artist') {
      const artists = data.artists?.items?.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        image: artist.images?.[0]?.url || null,
      })) || [];

      return NextResponse.json({ artists });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Spotify API error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Spotify' }, { status: 500 });
  }
}