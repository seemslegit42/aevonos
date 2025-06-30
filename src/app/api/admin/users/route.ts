
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.workspaceId || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const workspace = await prisma.workspace.findUnique({
    where: { id: session.workspaceId },
    select: { ownerId: true },
  });

  if (!workspace || workspace.ownerId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden. Architect access required.' }, { status: 403 });
  }

  try {
    const usersInWorkspace = await prisma.user.findMany({
      where: {
        workspaces: {
          some: {
            id: session.workspaceId,
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
    console.error('[API /admin/users GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve users.' }, { status: 500 });
  }
}
