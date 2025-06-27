
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getSession } from '@/lib/auth';

const WorkflowCreationRequestSchema = z.object({
  name: z.string(),
  isActive: z.boolean().optional().default(true),
  triggerType: z.enum(['api', 'schedule', 'event']).optional().default('api'),
  definition: z.record(z.any()).describe("JSONB representation of the workflow graph (e.g., LangGraph JSON structure)."),
});

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const workflows = await prisma.workflow.findMany({
        where: {
            workspaceId: session.workspaceId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return NextResponse.json(workflows);
  } catch (error) {
    console.error('[API /workflows GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve workflows.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const validation = WorkflowCreationRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid workflow definition.', issues: validation.error.issues }, { status: 400 });
    }

    const newWorkflow = await prisma.workflow.create({
      data: {
        ...validation.data,
        workspaceId: session.workspaceId,
      },
    });

    return NextResponse.json(newWorkflow, { status: 201 });
  } catch (error) {
    console.error('[API /workflows POST]', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create workflow.' }, { status: 500 });
  }
}
