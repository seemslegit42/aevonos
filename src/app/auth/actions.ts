
'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/firebase/admin';

export async function handleLogout() {
  cookies().delete('session');
  redirect('/login');
}

export async function deleteAccount() {
  console.log(`[Action: deleteAccount] Mock account deletion initiated. Logging out.`);
  // This would contain logic to delete the user from Firebase and Prisma.
  // For now, it just redirects.
  redirect('/login');
}

export async function acceptReclamationGift(): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getAuthenticatedUser();

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { reclamationGraceUntil: true },
    });

    if (!dbUser) {
        return { success: false, error: 'User not found in database.' };
    }

    if (dbUser.reclamationGraceUntil) {
        return { success: false, error: 'The Rite of Reclamation has already been performed. This gift cannot be accepted twice.' };
    }

    const gracePeriodEnds = new Date(Date.now() + 33 * 24 * 60 * 60 * 1000); // 33 days from now

    await prisma.user.update({
        where: { id: user.id },
        data: {
            reclamationGraceUntil: gracePeriodEnds,
        },
    });

    return { success: true };
  } catch (error) {
    console.error('[Action: acceptReclamationGift]', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred while performing the Rite.';
    return { success: false, error: message };
  }
}
