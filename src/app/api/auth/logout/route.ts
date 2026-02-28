import { NextRequest, NextResponse } from 'next/server';

/**
 * Logout API route
 * 
 * Clears the httpOnly auth cookie and returns success.
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );

  // Clear the httpOnly cookie
  response.cookies.delete('auth_token');

  return response;
}
