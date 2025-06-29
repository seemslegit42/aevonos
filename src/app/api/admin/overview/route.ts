
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.workspaceId || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const [userCount, agentCount, activeAgentCount, workspace] = await prisma.$transaction([
      prisma.user.count({ where: { workspaces: { some: { id: session.workspaceId } } } }),
      prisma.agent.count({ where: { workspaceId: session.workspaceId } }),
      prisma.agent.count({ where: { workspaceId: session.workspaceId, status: 'active' } }),
      prisma.workspace.findUnique({ where: { id: session.workspaceId }, select: { credits: true, planTier: true } }),
    ]);

    const overview = {
      userCount,
      agentCount,
      activeAgentCount,
      creditBalance: workspace?.credits,
      planTier: workspace?.planTier,
    };

    return NextResponse.json(overview);
  } catch (error) {
    console.error('[API /admin/overview GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve overview data.' }, { status: 500 });
  }
}
