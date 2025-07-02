
'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getServerActionSession } from '@/lib/auth';

export async function logout() {
  redirect('/login');
}

export async function deleteAccount() {
  console.log(`[Action: deleteAccount] Mock account deletion initiated. Logging out.`);
  await logout();
}

export async function acceptReclamationGift(): Promise<{ success: boolean; error?: string }> {
  const session = await getServerActionSession();
  if (!session?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
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
      where: { id: session.id },
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
