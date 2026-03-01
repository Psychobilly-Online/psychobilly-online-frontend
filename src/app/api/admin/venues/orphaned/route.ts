import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/admin/venues/orphaned
 * List venues with no events
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const country = searchParams.get('country');
    const city = searchParams.get('city');

    // Build backend URL with all relevant params
    const backendUrl = new URL(`${API_URL}/admin/venues/orphaned`);
    backendUrl.searchParams.set('page', page);
    backendUrl.searchParams.set('limit', limit);
    if (search) backendUrl.searchParams.set('search', search);
    if (status) backendUrl.searchParams.set('status', status);
    if (country) backendUrl.searchParams.set('country', country);
    if (city) backendUrl.searchParams.set('city', city);

    const response = await fetch(backendUrl.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Orphaned venues error:', error);
    return NextResponse.json({ error: 'Failed to fetch orphaned venues' }, { status: 500 });
  }
}
