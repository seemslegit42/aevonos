import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt, encrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/validator'];

  // If the path is public, let the request through
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }

  // Get the token from the session cookie
  const token = request.cookies.get('session')?.value;

  // Check if we're trying to access an API route or a page
  const isApiRoute = path.startsWith('/api');

  if (!token) {
    if (isApiRoute) {
        // For API routes, return a 401 Unauthorized error
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // For pages, redirect to the login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Validate the token
    const session = await decrypt(token);
    if (!session?.userId) {
        throw new Error('Invalid session token');
    }
    
    // Token is valid, refresh the session by creating a new token
    // and setting it in the response cookies. This creates a sliding session.
    const response = NextResponse.next();
    
    // Create a new expiration time
    const newExpires = new Date(Date.now() + 3600 * 1000); // 1 hour from now
    session.expires = newExpires;
    
    response.cookies.set({
        name: 'session',
        value: await encrypt(session), // encrypt will use the new expiration
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: newExpires, // Set cookie expiration
        path: '/',
    });

    return response;

  } catch (e) {
    // If token is invalid or expired, clear the cookie and redirect/return error
    const response = isApiRoute 
        ? NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 }) 
        : NextResponse.redirect(new URL('/login', request.url));
    
    response.cookies.delete('session');
    return response;
  }
}

// Configure the middleware to run on all paths except for static files and images
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
