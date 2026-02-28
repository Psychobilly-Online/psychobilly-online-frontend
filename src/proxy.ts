import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy for protecting routes based on authentication and authorization
 *
 * This runs on the Node.js runtime before requests reach the page.
 * It checks JWT tokens stored in httpOnly cookies and redirects
 * unauthenticated or unauthorized users appropriately.
 */

interface JWTPayload {
  user_id: number;
  username: string;
  email: string;
  group_id: number;
  iat: number; // Issued at
  exp: number; // Expiration
}

/**
 * Verify and decode JWT token
 * Note: In production, this should verify the signature using the secret key
 * For now, we do basic decoding and expiry check
 */
function verifyToken(token: string): JWTPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (base64url)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Token expired
    }

    return payload as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Check if user is an admin (group_id === 5)
 */
function isAdmin(payload: JWTPayload): boolean {
  return payload.group_id === 5;
}

/**
 * Protected route patterns
 */
const PROTECTED_ROUTES = {
  // Admin routes - require admin role
  admin: ['/admin'],
  // User routes - require any authenticated user
  user: ['/dashboard'],
};

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const isAdminRoute = PROTECTED_ROUTES.admin.some((route) => pathname.startsWith(route));
  const isUserRoute = PROTECTED_ROUTES.user.some((route) => pathname.startsWith(route));

  // If not a protected route, allow access
  if (!isAdminRoute && !isUserRoute) {
    return NextResponse.next();
  }

  // Get JWT token from cookie
  const token = request.cookies.get('auth_token')?.value;

  // No token - redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const payload = verifyToken(token);

  // Invalid or expired token - redirect to login
  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);

    // Clear invalid token
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token');

    return response;
  }

  // Check authorization for admin routes
  if (isAdminRoute && !isAdmin(payload)) {
    // User is authenticated but not admin - redirect to dashboard with error
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(dashboardUrl);
  }

  // User is authenticated and authorized - allow access
  return NextResponse.next();
}

/**
 * Configure which routes the proxy should run on
 *
 * We match:
 * - /admin/* (all admin routes)
 * - /dashboard/* (all user dashboard routes)
 *
 * We exclude:
 * - /api/* (API routes handle their own auth)
 * - /_next/* (Next.js internals)
 * - /login, /logout (auth pages)
 * - Static files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - login/logout pages
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|logout|.*\\..*|$).*)',
  ],
};
