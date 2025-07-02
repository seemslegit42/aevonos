
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
 
export default NextAuth(authConfig).auth;
 
export const config = {
  // By setting the matcher to an empty array, the middleware will not run on any route.
  matcher: [],
};
