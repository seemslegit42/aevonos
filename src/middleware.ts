
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
 
export default NextAuth(authConfig).auth;
 
export const config = {
  // Match all routes except for specific public paths and internal Next.js assets
  matcher: ['/((?!api/auth|login|register|pricing|_next/static|_next/image|favicon.ico|logo.png).*)'],
};
