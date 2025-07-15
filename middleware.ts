import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and setup page
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/setup') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    // Check setup status via API call instead of direct database access
    const setupResponse = await fetch(new URL('/api/setup', request.url));
    const { setupRequired } = await setupResponse.json();
    
    if (setupRequired && pathname !== '/setup') {
      // Redirect to setup page if setup is required
      return NextResponse.redirect(new URL('/setup', request.url));
    }
    
    if (!setupRequired && pathname === '/setup') {
      // Redirect away from setup page if setup is complete
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request to continue
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};