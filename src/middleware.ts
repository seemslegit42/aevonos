
import { auth } from '@/auth';
 
export default auth;
 
export const config = {
  // Match all routes except for specific public paths and internal Next.js assets
  matcher: ['/((?!api/auth|login|register|pricing|subscribe|validator|_next/static|_next/image|favicon.ico|logo.png|logo-light-purple.png).*)'],
};
