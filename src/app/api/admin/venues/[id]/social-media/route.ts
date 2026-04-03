import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/admin/venues/[id]/social-media - List venue social media links
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const token = request.headers.get('authorization');

    const response = await fetch(`${API_URL}/venues/${id}/social-media`, {
      headers: {
        ...(token ? { Authorization: token } : {}),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching venue social media:', error);
    return NextResponse.json({ error: 'Failed to fetch venue social media' }, { status: 500 });
  }
}

// POST /api/admin/venues/[id]/social-media - Create social media link
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const token = request.headers.get('authorization');
    const body = await request.json();

    const response = await fetch(`${API_URL}/venues/${id}/social-media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating social media link:', error);
    return NextResponse.json({ error: 'Failed to create social media link' }, { status: 500 });
  }
}
