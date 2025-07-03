import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/config/firebase-admin';

// List of allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://keradon.vercel.app'
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/auth/callback',
  '/api/firebase-config'
];

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/projects',
  '/analytics',
  '/tools',
  '/settings',
  '/new_projects',
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // CORS headers
  const origin = request.headers.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers
    });
  }

  // Skip auth check for public routes, API routes, and static files
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return response;
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    try {
      // Get the Firebase token from cookies
      const token = request.cookies.get('firebase-token')?.value;

      if (!token) {
        console.log('No Firebase token found, redirecting to sign-in');
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }

      // Verify the Firebase token
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      if (!decodedToken) {
        console.log('Invalid Firebase token, redirecting to sign-in');
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }

      // Token is valid, continue to the requested page
      console.log('Valid Firebase token for user:', decodedToken.email);
      return response;

    } catch (error) {
      console.error('Firebase token verification error:', error);
      
      // Clear invalid token and redirect to sign-in
      const response = NextResponse.redirect(new URL('/sign-in', request.url));
      response.cookies.delete('firebase-token');
      return response;
    }
  }

  return response;
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