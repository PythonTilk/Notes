import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that should be accessible during maintenance mode
const maintenanceExemptRoutes = [
  '/api/auth',
  '/auth',
  '/maintenance',
  '/setup',
  '/_next',
  '/favicon.ico',
];

// Routes that require admin access
const adminRoutes = [
  '/api/admin',
  '/admin',
];

// Routes that require moderator or admin access
const moderatorRoutes = [
  '/api/admin/users', // User management for moderators
];

async function checkSetupStatus(): Promise<boolean> {
  try {
    // Import prisma directly to avoid fetch loop
    const { prisma } = await import('./lib/prisma');
    const { UserRole } = await import('@prisma/client');
    
    const adminCount = await prisma.user.count({
      where: {
        role: UserRole.ADMIN,
      },
    });
    
    return adminCount === 0;
  } catch (error) {
    console.error('Error checking setup status:', error);
    return false;
  }
}

async function checkMaintenanceMode(): Promise<{ enabled: boolean; message?: string }> {
  try {
    // Import prisma directly to avoid fetch loop
    const { prisma } = await import('./lib/prisma');
    
    const settings = await prisma.systemSettings.findFirst();
    return {
      enabled: settings?.maintenanceMode || false,
      message: settings?.maintenanceMessage || 'System is under maintenance. Please try again later.',
    };
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    return { enabled: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and certain API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/setup') ||
    pathname.startsWith('/api/admin/settings') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/uploads/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    // Check setup status first
    const setupRequired = await checkSetupStatus();
    
    if (setupRequired && pathname !== '/setup') {
      return NextResponse.redirect(new URL('/setup', request.url));
    }
    
    if (!setupRequired && pathname === '/setup') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Skip further checks if setup is required
    if (setupRequired) {
      return NextResponse.next();
    }

    // Get user token
    const token = await getToken({ req: request });

    // Check maintenance mode
    const maintenance = await checkMaintenanceMode();
    
    if (maintenance.enabled) {
      // Allow admins to access during maintenance
      if (token?.sub) {
        // For API routes, we'll check role in the API itself
        if (pathname.startsWith('/api/')) {
          return NextResponse.next();
        }
        
        // For UI routes, redirect non-admins to maintenance page
        if (!maintenanceExemptRoutes.some(route => pathname.startsWith(route))) {
          // We'll assume non-admin for UI and let the maintenance page handle it
          return NextResponse.redirect(new URL('/maintenance', request.url));
        }
      } else {
        // Redirect unauthenticated users to maintenance page
        if (!maintenanceExemptRoutes.some(route => pathname.startsWith(route))) {
          return NextResponse.redirect(new URL('/maintenance', request.url));
        }
      }
    }

    // Check admin routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (!token?.sub) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }
      
      // Role checking will be done in the API routes themselves for better error handling
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request to proceed to avoid blocking the app
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};