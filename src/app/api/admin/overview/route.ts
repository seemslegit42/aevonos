
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerActionSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getServerActionSession();

    const workspace = await prisma.workspace.findUnique({
        where: { id: sessionUser.workspaceId },
        select: { ownerId: true, credits: true, planTier: true },
    });

    if (!workspace || workspace.ownerId !== sessionUser.id) {
        return NextResponse.json({ error: 'Forbidden. Architect access required.' }, { status: 403 });
    }

    const [userCount, agentCount, activeAgentCount] = await prisma.$transaction([
      prisma.user.count({ where: { workspaces: { some: { id: sessionUser.workspaceId } } } }),
      prisma.agent.count({ where: { workspaceId: sessionUser.workspaceId } }),
      prisma.agent.count({ where: { workspaceId: sessionUser.workspaceId, status: 'active' } }),
    ]);

    const overview = {
      userCount,
      agentCount,
      activeAgentCount,
      creditBalance: workspace.credits,
      planTier: workspace.planTier,
    };

    return NextResponse.json(overview);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /admin/overview GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve overview data.' }, { status: 500 });
  }
}
