
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

interface RouteParams {
  params: {
    workflowId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getSession(request);
  if (!session?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { workflowId } = params;
    const trigger_payload = await request.json();

    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, workspaceId: session.workspaceId },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found.' }, { status: 404 });
    }

    const workflowRun = await prisma.workflowRun.create({
      data: {
        workflowId: workflow.id,
        workspaceId: session.workspaceId,
        status: 'pending',
        triggerPayload: trigger_payload,
      },
    });

    const responseSummary = {
      runId: workflowRun.id,
      status: workflowRun.status,
      startedAt: workflowRun.startedAt,
    };

    return NextResponse.json(responseSummary, { status: 202 });

  } catch (error) {
    console.error(`[API /workflows/{workflowId}/run POST]`, error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid trigger payload. Must be valid JSON.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to trigger workflow run.' }, { status: 500 });
  }
}
