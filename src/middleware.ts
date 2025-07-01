
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Initialize NextAuth with the edge-compatible config.
// The `auth` function from this initialization is what the middleware will use.
// It relies only on the JWT for session data, not the database adapter.
export default NextAuth(authConfig).auth;

export const config = {
  // Match all routes except for specific public paths and internal Next.js assets
  matcher: ['/((?!api/auth|login|register|pricing|subscribe|validator|_next/static|_next/image|favicon.ico|logo.png|logo-light-purple.png).*)'],
}
