
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/auth';
import { WorkflowRunStatus } from '@prisma/client';


const FilterSchema = z.object({
  status: z.nativeEnum(WorkflowRunStatus).optional(),
  workflowId: z.string().optional(), // Now refers to the CUID
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validation = FilterSchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid filter parameters.', issues: validation.error.issues }, { status: 400 });
    }
    
    const { status, workflowId } = validation.data;
    const whereClause: any = {
        workspaceId: session.user.workspaceId
    };

    if (status) {
      whereClause.status = status;
    }

    if (workflowId) {
      whereClause.workflowId = workflowId;
    }
    
    const workflowRuns = await prisma.workflowRun.findMany({
      where: whereClause,
      include: {
        workflow: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json(workflowRuns);

  } catch (error) {
    console.error('[API /workflows/runs GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve workflow runs.' }, { status: 500 });
  }
}
