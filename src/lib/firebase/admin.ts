// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import type { User as PrismaUser, Workspace as PrismaWorkspace } from '@prisma/client';
import cache from '@/lib/redis';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  console.warn(
    '\x1b[33m%s\x1b[0m', // Yellow text
    'WARNING: FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin features will be disabled.'
  );
}

// Initialize Firebase Admin only if the service account key is available and valid.
if (serviceAccountKey && !admin.apps.length) {
  try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
  } catch(e) {
      console.error(
        '\x1b[31m%s\x1b[0m', // Red text
        "ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Please ensure it is a valid JSON object.", e
      );
  }
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
  // If admin is not initialized, we cannot authenticate the user.
  if (!admin.apps.length) {
      throw new Error('Unauthorized: Firebase Admin SDK not initialized. Cannot verify session.');
  }

  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    throw new Error('Unauthorized: No session cookie found.');
  }

  try {
    const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    
    // --- User Caching ---
    const userCacheKey = `user:${decodedToken.uid}`;
    let user: PrismaUser | null = null;
    try {
      const cachedUser = await cache.get(userCacheKey);
      if (cachedUser) {
        user = JSON.parse(cachedUser);
      }
    } catch (e) {
      console.error("Cache get failed for user", e);
    }
    
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: decodedToken.uid },
      });
      if (user) {
         try {
           await cache.set(userCacheKey, JSON.stringify(user), 'EX', CACHE_TTL_SECONDS);
         } catch (e) {
           console.error("Cache set failed for user", e);
         }
      }
    }

    // --- Workspace Caching ---
    let workspace: PrismaWorkspace | null = null;
    if (user) {
        const workspaceCacheKey = `workspace:user:${user.id}`;
        try {
            const cachedWorkspace = await cache.get(workspaceCacheKey);
            if (cachedWorkspace) {
                workspace = JSON.parse(cachedWorkspace);
            }
        } catch (e) {
            console.error("Cache get failed for workspace", e);
        }

        if (!workspace) {
            workspace = await prisma.workspace.findFirst({
                where: { members: { some: { id: user.id } } },
            });
            if (workspace) {
                try {
                    await cache.set(workspaceCacheKey, JSON.stringify(workspace), 'EX', CACHE_TTL_SECONDS);
                } catch(e) {
                    console.error("Cache set failed for workspace", e);
                }
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
