import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Cheap routing/redirection proxy placeholder.
 *
 * CRITICAL SECURITY ARCHITECTURE NOTE:
 * Next.js Edge/frontend proxy is strictly an optimization layer for UX
 * redirects and routing ergonomics (replaces deprecated middleware.ts in Next.js 16).
 * It is NOT an access control or security boundary. Client-side navigation and
 * requests can be modified, bypassed, or crafted outside the browser.
 *
 * The backend API (/api/v1) MUST independently authenticate, authorize, and
 * validate every single request. Never rely on frontend proxy for security.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPath =
    pathname === '/change-password' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/mentor') ||
    pathname.startsWith('/mentee');

  if (isProtectedPath) {
    const hasAuth = request.cookies.has('accessToken') || request.cookies.has('refreshToken');
    if (!hasAuth) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, and public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
