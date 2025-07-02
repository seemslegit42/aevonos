
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// The authentication system is now simplified to its bare essentials,
// as the actual session is mocked in `src/lib/auth.ts`.
// We remove all providers to prevent runtime errors.
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [], // No providers are needed as we are bypassing the auth flow.
  callbacks: {},
});
