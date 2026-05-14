import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://psychobilly-online.de/api/v1';

/**
 * BFF API Route - Venues (public search + authenticated create)
 * GET /api/venues?city=X&country_id=Y&search=Z - Search venues (no auth required)
 * POST /api/venues - Create a new venue (requires authentication)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.set(key, value);
    });

    const response = await fetch(`${API_BASE_URL}/venues?${params}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Unexpected response from upstream' }, { status: 502 });
    }
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Venues search API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch venues' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !/^Bearer\s+\S+$/.test(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/venues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error(
        `Create venue: upstream returned non-JSON (${response.status} ${response.statusText})`,
        '\nContent-Type:',
        contentType,
        '\nURL:',
        `${API_BASE_URL}/venues`,
        '\nBody preview:',
        responseText.slice(0, 2000),
      );
      return NextResponse.json(
        { error: 'Unexpected response from upstream', status: response.status },
        { status: 502 },
      );
    }
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Create venue API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create venue' }, { status: 500 });
  }
}
