
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerActionSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerActionSession();
    
    const now = new Date();
    // Clean up expired effects first (optional but good practice)
    await prisma.activeSystemEffect.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // Fetch the current active effects for the user's workspace
    const activeEffects = await prisma.activeSystemEffect.findMany({
      where: {
        workspaceId: session.workspaceId,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        createdAt: 'desc', // In case of multiple, the newest one takes precedence
      },
    });
    
    return NextResponse.json(activeEffects);

  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /workspaces/me/active-effects GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve active system effects.' }, { status: 500 });
  }
}
