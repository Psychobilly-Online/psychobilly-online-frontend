import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://psychobilly-online.de/api/v1';

/**
 * BFF API Route - Merge Bands (Admin only)
 * POST /api/bands/merge
 */
export async function POST(request: NextRequest) {
  try {
    // Get authorization header from request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    if (!body.target_id || !body.source_ids) {
      return NextResponse.json({ error: 'target_id and source_ids are required' }, { status: 400 });
    }

    // Call backend API with authorization
    const response = await fetch(`${API_BASE_URL}/bands/merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || 'Merge failed' },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Band merge API error:', error);

    return NextResponse.json({ error: error.message || 'Failed to merge bands' }, { status: 500 });
  }
}
