import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://keradon-co.vercel.app'
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/auth/callback',
  '/api/firebase-config',
  '/api/auth/check-user'
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
  const pathname = request.nextUrl.pathname;
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // CORS headers
  const origin = request.headers.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  // Security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.vercel.live https://apis.google.com https://accounts.google.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' https://accounts.google.com; img-src 'self' blob: data: https://lh3.googleusercontent.com https://api.dicebear.com; font-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com https://accounts.google.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; frame-src https://accounts.google.com https://*.firebaseapp.com;");

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
    // Get the Firebase token from cookies
    const token = request.cookies.get('firebase-token')?.value;
    
    if (!token) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Token is present, allow access
    // The actual token verification will happen on the client side or in API routes
    return NextResponse.next();
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