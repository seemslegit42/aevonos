
'use server';

import { auth } from '@/auth';

/**
 * A server-side helper to get the authenticated session user object.
 * This should be used in Server Components and Server Actions.
 * It will throw an error if the user is not authenticated.
 * @returns The user's session object, guaranteed to be non-null.
 */
export async function getServerActionSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized: No active session found.');
  }
  return session.user;
}

/**
 * An alternative session helper that returns the session object or null.
 * Can be used where authentication is optional.
 * @returns The user's session object, or null if not authenticated.
 */
export async function getSession() {
    return auth();
}
