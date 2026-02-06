import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://psychobilly-online.de/api/v1';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 24 hours - categories don't change often
      next: { revalidate: 86400 }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Categories API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
