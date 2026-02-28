import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/admin/genres - List genres with pagination
export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const per_page = searchParams.get('per_page') || '50';
    const include_inactive = searchParams.get('include_inactive') || '';

    const includeInactiveParam = include_inactive ? `&include_inactive=${include_inactive}` : '';
    const response = await fetch(
      `${API_URL}/genres?page=${page}&per_page=${per_page}${includeInactiveParam}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Genre list error:', error);
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 });
  }
}

// POST /api/admin/genres - Create new genre
export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/genres`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Genre create error:', error);
    return NextResponse.json({ error: 'Failed to create genre' }, { status: 500 });
  }
}
