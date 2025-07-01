
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerActionSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getServerActionSession();
    
    const workspace = await prisma.workspace.findUnique({
      where: { id: sessionUser.workspaceId },
      select: { ownerId: true },
    });

    if (!workspace || workspace.ownerId !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden. Architect access required.' }, { status: 403 });
    }

    const usersInWorkspace = await prisma.user.findMany({
      where: {
        workspaces: {
          some: {
            id: sessionUser.workspaceId,
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        lastLoginAt: true,
      },
      orderBy: {
        email: 'asc',
      },
    });

    return NextResponse.json(usersInWorkspace);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /admin/users GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve users.' }, { status: 500 });
  }
}
