// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import type { User as PrismaUser, Workspace as PrismaWorkspace } from '@prisma/client';
import redis from '@/lib/redis';

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

const CACHE_TTL_SECONDS = 60; // Cache user/workspace data for 1 minute

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
    
    // --- User Caching ---
    const userCacheKey = `user:${decodedToken.uid}`;
    let user: PrismaUser | null = null;
    const cachedUser = await redis.get(userCacheKey);

    if (cachedUser) {
      user = JSON.parse(cachedUser);
    } else {
      user = await prisma.user.findUnique({
        where: { id: decodedToken.uid },
      });
      if (user) {
        await redis.set(userCacheKey, JSON.stringify(user), 'EX', CACHE_TTL_SECONDS);
      }
    }

    // --- Workspace Caching ---
    let workspace: PrismaWorkspace | null = null;
    if (user) {
        const workspaceCacheKey = `workspace:user:${user.id}`;
        const cachedWorkspace = await redis.get(workspaceCacheKey);

        if (cachedWorkspace) {
            workspace = JSON.parse(cachedWorkspace);
        } else {
            workspace = await prisma.workspace.findFirst({
                where: { members: { some: { id: user.id } } },
            });
            if (workspace) {
                await redis.set(workspaceCacheKey, JSON.stringify(workspace), 'EX', CACHE_TTL_SECONDS);
            }
        }
    }

    return { user, workspace, firebaseUser: decodedToken };

  } catch (error) {
    console.error('Authentication error:', error);
    // Re-throw a more generic error to avoid leaking implementation details.
    throw new Error('Unauthorized: Invalid session.');
  }
}