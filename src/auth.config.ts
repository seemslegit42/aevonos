
import type { NextAuthConfig } from 'next-auth';
 
// The authentication configuration is stripped down to its essentials.
// Pages and callbacks are no longer needed as the auth flow is bypassed.
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
  providers: [],
} satisfies NextAuthConfig;
