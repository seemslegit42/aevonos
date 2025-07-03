
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const { user: sessionUser, workspace } = await getAuthenticatedUser();

    if (!workspace || workspace.ownerId !== sessionUser.id) {
        return NextResponse.json({ error: 'Forbidden. Architect access required.' }, { status: 403 });
    }

    const [userCount, agentCount, activeAgentCount] = await prisma.$transaction([
      prisma.user.count({ where: { workspaces: { some: { id: workspace.id } } } }),
      prisma.agent.count({ where: { workspaceId: workspace.id } }),
      prisma.agent.count({ where: { workspaceId: workspace.id, status: 'active' } }),
    ]);

    const overview = {
      userCount,
      agentCount,
      activeAgentCount,
      creditBalance: Number(workspace.credits),
      planTier: workspace.planTier,
    };

    return NextResponse.json(overview);
  } catch (error) {
    if (error instanceof Error && (error.message.includes('token expired') || error.message.includes('no token'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /admin/overview GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve overview data.' }, { status: 500 });
  }
}
