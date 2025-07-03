
// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { User as PrismaUser, Workspace as PrismaWorkspace } from '@prisma/client';

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

type AuthenticatedUser = {
  firebaseUser: admin.auth.DecodedIdToken;
  user: PrismaUser | null;
  workspace: PrismaWorkspace | null;
}

/**
 * A server-side helper to get the authenticated user and their workspace.
 * It verifies the Firebase session cookie and fetches corresponding Prisma records if they exist.
 * This function is central to the auth flow and does NOT throw an error if the Prisma user/workspace is not found,
 * allowing calling services (like onboarding) to handle that specific case.
 * @returns An object containing the decoded Firebase token, and the (potentially null) Prisma user and workspace.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    throw new Error('Unauthorized: No session cookie found.');
  }

  try {
    const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    
    // Now, finding the user is optional. It might not exist yet if they are onboarding.
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
    });

    // Only look for a workspace if the user exists in our DB.
    const workspace = user ? await prisma.workspace.findFirst({
        where: { members: { some: { id: user.id } } },
    }) : null;

    return { user, workspace, firebaseUser: decodedToken };

  } catch (error) {
    console.error('Authentication error:', error);
    // Re-throw a more generic error to avoid leaking implementation details.
    throw new Error('Unauthorized: Invalid session.');
  }
}
