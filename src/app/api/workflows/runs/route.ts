
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const FilterSchema = z.object({
  status: z.enum(['pending', 'running', 'completed', 'failed', 'paused']).optional(),
  workflowId: z.string().uuid().optional(),
});

// Corresponds to operationId `listWorkflowRuns`
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validation = FilterSchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid filter parameters.', issues: validation.error.issues }, { status: 400 });
    }
    
    const { status, workflowId } = validation.data;
    const whereClause: any = {
        // tenantId: 1 // In a real app, this would come from auth.
    };

    if (status) {
      whereClause.status = status;
    }

    if (workflowId) {
      // We need to find the internal integer ID for the workflow definition
      // based on its public UUID to filter the runs.
      const workflowDef = await (prisma as any).workflow.findUnique({
        where: { uuid: workflowId },
        select: { id: true },
      });
      
      if (workflowDef) {
        whereClause.workflowId = workflowDef.id; // Filter by the FK
      } else {
        // If the workflowId doesn't exist, no runs can match.
        return NextResponse.json([]);
      }
    }
    
    const workflowRuns = await (prisma as any).workflowRun.findMany({
      where: whereClause,
      orderBy: {
        startedAt: 'desc',
      },
    });

    return NextResponse.json(workflowRuns);

  } catch (error) {
    console.error('[API /workflows/runs GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve workflow runs.' }, { status: 500 });
  }
}
