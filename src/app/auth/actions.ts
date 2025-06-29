
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getServerActionSession } from '@/lib/auth';

// --- LOGOUT --- //
export async function logout() {
  cookies().delete('session');
  redirect('/login');
}

// In a real app, this would be a "soft delete" or a more complex process.
// For now, we will just log the user out as a placeholder for this destructive action.
export async function deleteAccount() {
  console.log(`[Action: deleteAccount] Mock account deletion initiated. Logging out.`);
  await logout();
}

/**
 * Allows a user to accept the one-time "Rite of Reclamation" gift.
 * @returns An object indicating success or failure.
 */
export async function acceptReclamationGift(): Promise<{ success: boolean; error?: string }> {
  const session = await getServerActionSession();
  if (!session?.userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { reclamationGraceUntil: true },
    });

    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    if (user.reclamationGraceUntil) {
      return { success: false, error: 'The Rite of Reclamation has already been performed. This gift cannot be accepted twice.' };
    }

    const gracePeriodEnds = new Date(Date.now() + 33 * 24 * 60 * 60 * 1000); // 33 days from now

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        reclamationGraceUntil: gracePeriodEnds,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('[Action: acceptReclamationGift]', error);
    return { success: false, error: 'An unexpected error occurred while performing the Rite.' };
  }
}
