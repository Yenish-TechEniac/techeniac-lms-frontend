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
function extractRoleFromJwt(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2 || !parts[1]) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload = JSON.parse(json) as { role?: unknown };
    return typeof payload.role === 'string' ? payload.role : null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPath =
    pathname === '/change-password' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/mentor') ||
    pathname.startsWith('/mentee');

  if (isProtectedPath) {
    const accessToken = request.cookies.get('accessToken')?.value;
    const hasAuth = Boolean(accessToken || request.cookies.has('refreshToken'));
    if (!hasAuth) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const role = extractRoleFromJwt(accessToken);
    if (role) {
      // Role-based route isolation at network boundary
      if (pathname.startsWith('/admin') && role !== 'SUPER_ADMIN') {
        const redirectUrl = new URL(role === 'MENTOR' ? '/mentor' : '/mentee', request.url);
        return NextResponse.redirect(redirectUrl);
      }
      if (pathname.startsWith('/mentor') && role !== 'MENTOR' && role !== 'SUPER_ADMIN') {
        const redirectUrl = new URL(role === 'MENTEE' ? '/mentee' : '/admin', request.url);
        return NextResponse.redirect(redirectUrl);
      }
      if (pathname.startsWith('/mentee') && role !== 'MENTEE' && role !== 'SUPER_ADMIN') {
        const redirectUrl = new URL(role === 'MENTOR' ? '/mentor' : '/admin', request.url);
        return NextResponse.redirect(redirectUrl);
      }
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
