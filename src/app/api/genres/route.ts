import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://psychobilly-online.de/api/v1';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/genres`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 1 hour - genres don't change often, but we want updates to propagate faster
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const apiData = await response.json();

    // The API returns {genres: [...]} but we need {data: [...]}
    // Filter for active genres only (backend should already do this, but double-check)
    const allGenres = (apiData.genres || []).filter(
      (genre: any) => genre.active === undefined || genre.active === 1 || genre.active === true,
    );

    // Extract all sub-genre names from all genres to exclude them
    const subGenreNames = new Set<string>();
    allGenres.forEach((genre: any) => {
      if (genre.sub_genres && Array.isArray(genre.sub_genres)) {
        genre.sub_genres.forEach((subGenre: string) => subGenreNames.add(subGenre));
      }
    });

    // Filter to only include main genres (not listed as sub-genres)
    const mainGenres = allGenres.filter((genre: any) => !subGenreNames.has(genre.name));

    return NextResponse.json({ data: mainGenres });
  } catch (error: any) {
    console.error('Genres API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch genres' }, { status: 500 });
  }
}
