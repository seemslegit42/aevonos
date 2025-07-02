
'use server';

import prisma from '@/lib/prisma';
import type { User, UserPsyche, UserRole } from '@prisma/client';

// This function now acts as the single source of truth for the "logged in" user.
// It fetches the Architect user from the database to provide a consistent, valid session.
async function getMockUserSession() {
  const user = await prisma.user.findUnique({
    where: { email: 'architect@aevonos.com' },
  });

  if (!user) {
    throw new Error('Architect user not found in database. Please run `npx prisma db seed` to seed the database.');
  }

  const workspace = await prisma.workspace.findFirst({
      where: { ownerId: user.id }
  });

   if (!workspace) {
    throw new Error('Architect workspace not found in database. Please run `npx prisma db seed` to seed the database.');
  }

  // We construct a session-like object that satisfies the application's needs.
  return {
    ...user,
    id: user.id,
    workspaceId: workspace.id,
    role: user.role as UserRole,
  };
}

/**
 * A server-side helper to get the authenticated session user object.
 * This now returns the hardcoded Architect user session.
 * @returns The user's session object, guaranteed to be non-null.
 */
export async function getServerActionSession() {
  return getMockUserSession();
}

/**
 * An alternative session helper that returns the session user object or null.
 * This now returns the hardcoded Architect user session.
 */
export async function getSession() {
    return getMockUserSession();
}

// This was removed as it caused a build error in 'use server' files.
// Components needing `auth` should import directly from `@/auth`.
