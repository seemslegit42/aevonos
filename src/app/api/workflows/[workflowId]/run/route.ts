
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { WorkflowRunStatus } from '@prisma/client';

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
    
    // Don't block the response. Simulate the workflow execution in the background.
    // This is a common pattern in serverless environments for long-running tasks.
    (async () => {
        try {
            // Simulate initial processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            await prisma.workflowRun.update({
                where: { id: workflowRun.id },
                data: { status: WorkflowRunStatus.running }
            });

            // Simulate main work finishing
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Randomly succeed or fail to make the simulation more realistic
            const isSuccess = Math.random() > 0.2; 

            await prisma.workflowRun.update({
                where: { id: workflowRun.id },
                data: { 
                    status: isSuccess ? WorkflowRunStatus.completed : WorkflowRunStatus.failed,
                    finishedAt: new Date(),
                    output: isSuccess 
                        ? { result: 'Workflow completed successfully with expected output.' }
                        : { error: 'An unexpected error occurred during execution.' }
                }
            });
        } catch (e) {
            console.error(`[Workflow Simulation Error] for run ${workflowRun.id}:`, e);
             await prisma.workflowRun.update({
                where: { id: workflowRun.id },
                data: { 
                    status: WorkflowRunStatus.failed,
                    finishedAt: new Date(),
                    output: { error: 'The workflow simulation process itself failed.' }
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
