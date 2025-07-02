
'use server';

// This function now acts as the single source of truth for the "logged in" user.
// It returns a hardcoded mock user to bypass database initialization errors for UI development.
// IMPORTANT: This file MUST NOT import 'prisma' directly, as that can trigger the
// client initialization error before the schema with binaryTargets is processed.
import type { User, UserPsyche, UserRole } from '@prisma/client';

async function getMockUserSession() {
  // This is a hardcoded mock user object.
  // It avoids any database calls to allow the UI to render even if Prisma is not initialized.
  const mockUser = {
    id: 'clwz1d2c00000z1y1a2b3c4d5',
    email: 'architect@aevonos.com',
    firstName: 'The',
    lastName: 'Architect',
    agentAlias: 'BEEP',
    role: 'ADMIN' as UserRole,
    psyche: 'ZEN_ARCHITECT' as UserPsyche,
    workspaceId: 'clwz1d2c00001z1y1d2e3f4g5',
    reclamationGraceUntil: null,
    corePainIndex: 75,
    foundingBenediction: "The vow is made. The sacrifice is burned. Welcome, Sovereign.",
    firstWhisper: null,
    unlockedChaosCardKeys: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    password: 'hashed_password_placeholder',
    foundingVow: "The tyranny of dashboards.",
    foundingGoal: "An agentic operating system."
  };

  return mockUser;
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
