
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    workflowId: string;
  };
}

// Corresponds to operationId `triggerWorkflowRun`
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { workflowId } = params;
    const trigger_payload = await request.json();

    // 1. Find the workflow definition by its public UUID
    const workflow = await (prisma as any).workflow.findUnique({
      where: { uuid: workflowId },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found.' }, { status: 404 });
    }

    // In a real system, you would now enqueue this for execution by a LangGraph runner.
    // For now, we will create a record of the run instance to show it has been initiated.

    // 2. Create the workflow run instance in the database
    const workflowRun = await (prisma as any).workflowRun.create({
      data: {
        workflowId: workflow.id, // FK to the workflow definition internal ID
        tenantId: workflow.tenantId || 1, // Inherit tenantId or default
        status: 'pending',
        triggerPayload: trigger_payload,
        // The `output` field will be populated when the workflow completes.
      },
    });

    // 3. Return the WorkflowRunSummary as per the spec
    const responseSummary = {
      runId: workflowRun.uuid, // Publicly exposed UUID for the run
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
