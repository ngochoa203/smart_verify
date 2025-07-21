import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || 
                       path === '/register' || 
                       path === '/' || 
                       path.startsWith('/products') || 
                       path === '/verify' ||
                       path.startsWith('/api/') ||
                       path.startsWith('/categories') ||
                       path.startsWith('/debug')
  
  // Get token from cookies or authorization header
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.split(' ')[1];
  
  console.log(`Middleware: Path=${path}, Token=${token}, IsPublicPath=${isPublicPath}`);
  
  // Redirect logic
  if (isPublicPath && token) {
    // If user is logged in and tries to access login/register page, redirect to home
    if (path === '/login' || path === '/register') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // If user is not logged in and tries to access protected routes
  if (!isPublicPath && !token) {
    // Store the original URL to redirect back after login
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('callbackUrl', encodeURI(request.nextUrl.pathname));
    return NextResponse.redirect(redirectUrl);
  }
  
  // Helper: decode JWT payload
  function decodeJwtPayload(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    } catch {
      return null;
    }
  }

  // Admin routes check
  if (path.startsWith('/admin') && token) {
    const payload = decodeJwtPayload(token);
    if (!payload || payload.user_type !== 'admin') {
      console.log('User is not an admin, redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    }
    console.log('Admin access granted');
  }

  // Seller routes check
  if (path.startsWith('/seller') && token) {
    const payload = decodeJwtPayload(token);
    if (!payload || (payload.user_type !== 'seller' && payload.user_type !== 'admin')) {
      console.log('User is not a seller or admin, redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    }
    console.log('Seller access granted');
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/account/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/admin/:path*',
    '/seller/:path*',
    '/favorites/:path*',
    '/cart/:path*',
    '/login',
    '/register',
  ],
};