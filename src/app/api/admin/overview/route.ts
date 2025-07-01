
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.workspaceId || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const workspace = await prisma.workspace.findUnique({
        where: { id: session.user.workspaceId },
        select: { ownerId: true, credits: true, planTier: true },
    });

    if (!workspace || workspace.ownerId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden. Architect access required.' }, { status: 403 });
    }

    const [userCount, agentCount, activeAgentCount] = await prisma.$transaction([
      prisma.user.count({ where: { workspaces: { some: { id: session.user.workspaceId } } } }),
      prisma.agent.count({ where: { workspaceId: session.user.workspaceId } }),
      prisma.agent.count({ where: { workspaceId: session.user.workspaceId, status: 'active' } }),
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
    console.error('[API /admin/overview GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve overview data.' }, { status: 500 });
  }
}
