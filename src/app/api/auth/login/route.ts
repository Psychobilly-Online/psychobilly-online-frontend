import { NextRequest, NextResponse } from 'next/server';

/**
 * Login API route (BFF pattern)
 *
 * Proxies login request to backend API and sets httpOnly cookie
 * for server-side middleware authentication.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    // Forward login request to backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://psychobilly-online.de/api/v1';
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    // If login failed, return error
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Login failed' },
        { status: response.status },
      );
    }

    // Validate response data
    if (!data.token || !data.user) {
      return NextResponse.json(
        { message: 'Invalid response from authentication server' },
        { status: 500 },
      );
    }

    // Create response with user data
    const responseData = {
      user: data.user,
      token: data.token,
      expires_in: data.expires_in || 3600,
    };

    const nextResponse = NextResponse.json(responseData, { status: 200 });

    // Set httpOnly cookie for server-side middleware
    // This cookie is NOT accessible to client-side JavaScript
    const maxAge = data.expires_in || 3600; // 1 hour default

    nextResponse.cookies.set('auth_token', data.token, {
      httpOnly: true, // Cannot be accessed by JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax', // CSRF protection
      maxAge: maxAge,
      path: '/',
    });

    return nextResponse;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An error occurred during login' }, { status: 500 });
  }
}
