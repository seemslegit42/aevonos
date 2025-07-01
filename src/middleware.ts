
export { auth as middleware } from '@/auth';

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!api/auth|login|register|pricing|subscribe|validator|_next/static|_next/image|favicon.ico|logo.png|logo-light-purple.png).*)'],
}
