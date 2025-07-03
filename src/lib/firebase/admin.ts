
// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * A server-side helper to get the authenticated user and their workspace.
 * This should be used in Server Components and Server Actions where auth is required.
 * It will throw an error if the user is not authenticated or not found in the DB.
 * @returns The user and workspace objects.
 */
export async function getAuthenticatedUser() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    throw new Error('Unauthorized: No session cookie found.');
  }

  try {
    const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
    });

    if (!user) {
      throw new Error('User not found in database.');
    }
    
    const workspace = await prisma.workspace.findFirst({
        where: { members: { some: { id: user.id } } },
    });
    
    if (!workspace) {
        throw new Error('Workspace not found for user.');
    }

    return { user, workspace };
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Unauthorized: Invalid session.');
  }
}
