
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/firebase/admin';

/**
 * @fileOverview API endpoint to retrieve active system effects (e.g., from Chaos Cards) for the current workspace.
 * This is used by the main layout to apply dynamic themes.
 */

export async function GET(request: Request) {
  try {
    const { workspace } = await getAuthenticatedUser();
    
    // If no authenticated user/workspace, there are no effects.
    if (!workspace) {
      return NextResponse.json([]);
    }
    
    const now = new Date();
    
    // It's good practice to clean up expired effects periodically.
    // Doing it on read is simple, but a cron job would be more efficient for a large-scale system.
    await prisma.activeSystemEffect.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // Fetch the current, non-expired active effects for the user's workspace.
    const activeEffects = await prisma.activeSystemEffect.findMany({
      where: {
        workspaceId: workspace.id,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        createdAt: 'desc', // In case of multiple, the newest one takes precedence.
      },
    });
    
    return NextResponse.json(activeEffects);

  } catch (error) {
    // If a user is not logged in, `getAuthenticatedUser` will throw, and we can treat that as "no effects active".
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json([]);
    }
    
    console.error('[API /workspaces/me/active-effects GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve active system effects.' }, { status: 500 });
  }
}
