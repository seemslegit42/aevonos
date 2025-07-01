
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Initialize NextAuth with the Edge-compatible configuration
const { auth } = NextAuth(authConfig);

// Export the middleware with a refined matcher to protect all routes by default
// while allowing access to public and essential API routes.
export default auth;

export const config = {
  // Match all routes except for specific public paths and internal Next.js assets
  matcher: ['/((?!api/auth|login|register|pricing|subscribe|validator|_next/static|_next/image|favicon.ico|logo.png|logo-light-purple.png).*)'],
}
