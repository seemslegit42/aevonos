
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerActionSession } from '@/lib/auth';

interface RouteParams {
  params: {
    runId: string;
  };
}

// GET /api/workflows/runs/{runId}
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getServerActionSession();
    const { runId } = params;

    const workflowRun = await prisma.workflowRun.findFirst({
      where: {
        id: runId,
        workspaceId: sessionUser.workspaceId,
      },
      include: {
        workflow: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!workflowRun) {
      return NextResponse.json({ error: 'Workflow run not found.' }, { status: 404 });
    }

    return NextResponse.json(workflowRun);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(`[API /workflows/runs/{runId} GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve workflow run.' }, { status: 500 });
  }
}
