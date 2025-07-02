
'use server';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerActionSession } from '@/lib/auth';
import { UserRole, WorkflowRunStatus } from '@prisma/client';
import { executeWorkflow } from '@/lib/workflow-executor';

interface RouteParams {
  params: {
    workflowId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getServerActionSession();
    if (sessionUser.role === UserRole.AUDITOR) {
        return NextResponse.json({ error: 'Permission denied. This action is not available for auditors.' }, { status: 403 });
    }
    
    const { workflowId } = params;
    const trigger_payload = await request.json();

    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, workspaceId: sessionUser.workspaceId },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found.' }, { status: 404 });
    }

    const workflowRun = await prisma.workflowRun.create({
      data: {
        workflowId: workflow.id,
        workspaceId: sessionUser.workspaceId,
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

            const { finalPayload, executionLog } = await executeWorkflow(
                workflow, 
                trigger_payload, 
                { workspaceId: sessionUser.workspaceId, userId: sessionUser.id, psyche: sessionUser.psyche }
            );

            await prisma.workflowRun.update({
                where: { id: workflowRun.id },
                data: { 
                    status: WorkflowRunStatus.completed,
                    finishedAt: new Date(),
                    output: finalPayload,
                    log: executionLog,
                }
            });
        } catch (e) {
            console.error(`[Workflow Execution Error] for run ${workflowRun.id}:`, e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during execution.';
            const logFromError = (e as any).executionLog || [];

             await prisma.workflowRun.update({
                where: { id: workflowRun.id },
                data: { 
                    status: WorkflowRunStatus.failed,
                    finishedAt: new Date(),
                    output: { error: errorMessage },
                    log: logFromError,
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
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid trigger payload. Must be valid JSON.' }, { status: 400 });
    }
    console.error(`[API /workflows/{workflowId}/run POST]`, error);
    return NextResponse.json({ error: 'Failed to trigger workflow run.' }, { status: 500 });
  }
}

    