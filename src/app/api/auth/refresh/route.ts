import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Create response with refreshed token
    const nextResponse = NextResponse.json(data);

    // Update httpOnly cookie with new token if present
    if (data.token) {
      const maxAge = data.expires_in || 3600; // 1 hour default

      nextResponse.cookies.set('auth_token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: maxAge,
        path: '/',
      });
    }

    return nextResponse;
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
  }
}
