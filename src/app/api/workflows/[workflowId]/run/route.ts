
'use server';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { WorkflowRunStatus } from '@prisma/client';
import { executeWorkflow } from '@/lib/workflow-executor';

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
        status: WorkflowRunStatus.pending,
        triggerPayload: trigger_payload,
        startedAt: new Date(),
      },
    });
    
    // Don't block the API response. Execute the workflow in the background.
    (async () => {
        try {
            await prisma.workflowRun.update({
                where: { id: workflowRun.id },
                data: { status: WorkflowRunStatus.running }
            });

            // The executor will now return both the result and the log
            const { finalPayload, executionLog } = await executeWorkflow(
                workflow, 
                trigger_payload, 
                { workspaceId: session.workspaceId! }
            );

            await prisma.workflowRun.update({
                where: { id: workflowRun.id },
                data: { 
                    status: WorkflowRunStatus.completed,
                    finishedAt: new Date(),
                    output: finalPayload, // Store the actual result from the execution
                    log: executionLog, // Store the execution log
                }
            });
        } catch (e) {
            console.error(`[Workflow Execution Error] for run ${workflowRun.id}:`, e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during execution.';
            // Check if the error object contains our attached execution log
            const logFromError = (e as any).executionLog || [];

             await prisma.workflowRun.update({
                where: { id: workflowRun.id },
                data: { 
                    status: WorkflowRunStatus.failed,
                    finishedAt: new Date(),
                    output: { error: errorMessage },
                    log: logFromError, // Save the log up to the point of failure
                }
            });
        }
    })();


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
