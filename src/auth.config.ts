
import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  providers: [
    // Providers that require a database connection are defined in the main 
    // auth.ts file to avoid trying to run them in the Edge runtime.
  ],
  callbacks: {
    // The authorized callback is used by the middleware to decide if a request is allowed.
    authorized({ auth, request: { nextUrl } }) {
      // The `matcher` in `middleware.ts` already defines which routes are protected.
      // If the user is logged in (auth object exists), allow the request.
      // Otherwise, NextAuth.js will automatically redirect to the sign-in page.
      const isLoggedIn = !!auth?.user;
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
