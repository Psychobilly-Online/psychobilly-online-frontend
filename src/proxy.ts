import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Proxy for protecting routes based on authentication and authorization
 *
 * This runs on the Node.js runtime before requests reach the page.
 * It checks JWT tokens stored in httpOnly cookies and redirects
 * unauthenticated or unauthorized users appropriately.
 */

/**
 * JWT payload structure from PHP backend
 * Note: PHP backend uses 'sub' (subject) for user ID, which is JWT standard
 */
interface UserJWTPayload {
  sub: number; // User ID (JWT standard field)
  username: string;
  email: string;
  group_id: number;
  iat: number; // Issued at
  exp: number; // Expiration
}

/**
 * Verify JWT token signature and decode payload
 * Uses jose library to properly verify the JWT signature with the secret key
 */
async function verifyToken(token: string): Promise<UserJWTPayload | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not configured');
      return null;
    }

    // Verify JWT signature and decode payload
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

    // Validate required fields (PHP backend uses 'sub' for user ID per JWT standard)
    if (
      typeof payload.sub !== 'number' ||
      typeof payload.username !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.group_id !== 'number' ||
      typeof payload.iat !== 'number' ||
      typeof payload.exp !== 'number'
    ) {
      console.error('Invalid JWT payload structure:', {
        sub: typeof payload.sub,
        username: typeof payload.username,
        email: typeof payload.email,
        group_id: typeof payload.group_id,
        iat: typeof payload.iat,
        exp: typeof payload.exp,
      });
      return null;
    }

    // Return validated and typed payload
    return {
      sub: payload.sub,
      username: payload.username,
      email: payload.email,
      group_id: payload.group_id,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Check if user is an admin (group_id === 5)
 */
function isAdmin(payload: UserJWTPayload): boolean {
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

export default async function proxy(request: NextRequest) {
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

  // Verify token (this now properly verifies the signature)
  const payload = await verifyToken(token);

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
