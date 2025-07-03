
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { UserRole } from '@prisma/client';

const WorkflowUpdateSchema = z.object({
  name: z.string().optional(),
  definition: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: {
    workflowId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { workspace } = await getAuthenticatedUser();
    if (!workspace) {
        return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
    }
    const { workflowId } = params;
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, workspaceId: workspace.id },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found.' }, { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(`[API /workflows/{id} GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve workflow.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, workspace } = await getAuthenticatedUser();
    if (!user || !workspace || (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER)) {
        return NextResponse.json({ error: 'Permission denied. Administrator or Manager access required.' }, { status: 403 });
    }
    
    const { workflowId } = params;
    const body = await request.json();
    const validation = WorkflowUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid workflow data.', issues: validation.error.issues }, { status: 400 });
    }

    const updatedWorkflow = await prisma.workflow.updateMany({
      where: { id: workflowId, workspaceId: workspace.id },
      data: validation.data,
    });
    
    if (updatedWorkflow.count === 0) {
        return NextResponse.json({ error: 'Workflow not found or you do not have permission to update it.' }, { status: 404 });
    }

    const returnedWorkflow = await prisma.workflow.findUnique({ where: { id: workflowId } });

    return NextResponse.json(returnedWorkflow);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(`[API /workflows/{id} PUT]`, error);
    return NextResponse.json({ error: 'Failed to update workflow.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, workspace } = await getAuthenticatedUser();
    if (!user || !workspace || (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER)) {
        return NextResponse.json({ error: 'Permission denied. Administrator or Manager access required.' }, { status: 403 });
    }
    
    const { workflowId } = params;
    
    const result = await prisma.workflow.deleteMany({
      where: { id: workflowId, workspaceId: workspace.id },
    });

    if (result.count === 0) {
        return NextResponse.json({ error: 'Workflow not found.' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(`[API /workflows/{id} DELETE]`, error);
    return NextResponse.json({ error: 'Failed to delete workflow.' }, { status: 500 });
  }
}
