
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

interface RouteParams {
  params: {
    runId: string;
  };
}

// GET /api/workflows/runs/{runId}
// Corresponds to an extension of the `listWorkflowRuns` operationId in api-spec.md
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getSession(request);
  if (!session?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { runId } = params;

    const workflowRun = await prisma.workflowRun.findFirst({
      where: {
        id: runId,
        workspaceId: session.workspaceId,
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
    console.error(`[API /workflows/runs/{runId} GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve workflow run.' }, { status: 500 });
  }
}
