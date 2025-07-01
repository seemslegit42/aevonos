import { auth } from '@/auth';
import type { Session } from 'next-auth';

/**
 * A server-side helper to get the authenticated session user object.
 * Throws an error if the user is not authenticated or lacks a workspace.
 * Use this in Server Actions and API Routes to protect them.
 * @returns The user's session object, guaranteed to be non-null.
 */
export async function getServerActionSession() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.workspaceId) {
    // In API routes, this will be caught and a 401 returned.
    // In Server Actions, this will bubble up.
    throw new Error('Unauthorized: No active session found.');
  }
  return session.user;
}

/**
 * An alternative session helper that returns the session user object or null.
 * Useful for pages that can be viewed by both authenticated and unauthenticated users.
 * Does not throw an error.
 */
export async function getSession() {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.workspaceId) {
        return null;
    }
    return session.user;
}
