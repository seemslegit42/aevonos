
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  // Define public paths that do not require authentication.
  // /register redirects to /login but is included for clarity.
  const publicPaths = [
    '/login',
    '/register',
    '/pricing',
    '/auth/action',
  ];

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // If the user has no session cookie and is trying to access a protected route,
  // redirect them to the login page.
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If the user has a session and is trying to access a page they shouldn't
  // see when logged in (like login or pricing), redirect them to the home page.
  if (session && (pathname === '/login' || pathname === '/pricing')) {
      return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow the request to proceed if none of the above conditions are met.
  return NextResponse.next();
}

export const config = {
  // Match all routes except for API routes, static files, and images.
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|favicon.ico).*)'],
};
