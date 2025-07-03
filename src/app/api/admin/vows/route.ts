
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const { user: sessionUser, workspace } = await getAuthenticatedUser();

    if (!workspace || workspace.ownerId !== sessionUser.id) {
        return NextResponse.json({ error: 'Forbidden. Architect access required.' }, { status: 403 });
    }

    const usersWithVows = await prisma.user.findMany({
      where: {
        workspaces: {
          some: {
            id: workspace.id,
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        psyche: true,
        foundingVow: true,
        foundingGoal: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(usersWithVows);
  } catch (error) {
    if (error instanceof Error && (error.message.includes('token expired') || error.message.includes('no token'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /admin/vows GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve vows.' }, { status: 500 });
  }
}
