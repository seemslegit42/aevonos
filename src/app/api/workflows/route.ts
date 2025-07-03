
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { UserRole } from '@prisma/client';

const WorkflowCreationRequestSchema = z.object({
  name: z.string(),
  isActive: z.boolean().optional().default(true),
  triggerType: z.enum(['api', 'schedule', 'event']).optional().default('api'),
  definition: z.record(z.any()).describe("JSONB representation of the workflow graph (e.g., LangGraph JSON structure)."),
});

export async function GET(request: NextRequest) {
  try {
    const { workspace } = await getAuthenticatedUser();
    if (!workspace) {
        return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
    }
    const workflows = await prisma.workflow.findMany({
        where: {
            workspaceId: workspace.id,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return NextResponse.json(workflows);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /workflows GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve workflows.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, workspace } = await getAuthenticatedUser();
    if (!user || !workspace || (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER)) {
        return NextResponse.json({ error: 'Permission denied. Administrator or Manager access required.' }, { status: 403 });
    }
    
    const body = await request.json();
    const validation = WorkflowCreationRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid workflow definition.', issues: validation.error.issues }, { status: 400 });
    }

    const newWorkflow = await prisma.workflow.create({
      data: {
        ...validation.data,
        workspaceId: workspace.id,
      },
    });

    return NextResponse.json(newWorkflow, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    console.error('[API /workflows POST]', error);
    return NextResponse.json({ error: 'Failed to create workflow.' }, { status: 500 });
  }
}
