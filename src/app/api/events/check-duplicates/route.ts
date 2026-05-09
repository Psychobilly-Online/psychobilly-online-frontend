import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://psychobilly-online.de/api/v1';

/**
 * BFF API Route - Check Duplicate Events
 * POST /api/events/check-duplicates - Public endpoint, no auth required
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/events/check-duplicates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Check duplicates API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check duplicates' },
      { status: 500 }
    );
  }
}
