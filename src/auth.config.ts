
import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
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
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ['/']; // Add any other root protected paths here
      const isProtected = protectedPaths.some(path => nextUrl.pathname.startsWith(path));

      if (isProtected) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
