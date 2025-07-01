
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/auth';
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
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { workflowId } = params;
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, workspaceId: session.user.workspaceId },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found.' }, { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error(`[API /workflows/{id} GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve workflow.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.workspaceId || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER)) {
      return NextResponse.json({ error: 'Permission denied. Administrator or Manager access required.' }, { status: 403 });
  }
  
  try {
    const { workflowId } = params;
    const body = await request.json();
    const validation = WorkflowUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid workflow data.', issues: validation.error.issues }, { status: 400 });
    }

    const updatedWorkflow = await prisma.workflow.updateMany({
      where: { id: workflowId, workspaceId: session.user.workspaceId },
      data: validation.data,
    });
    
    if (updatedWorkflow.count === 0) {
        return NextResponse.json({ error: 'Workflow not found or you do not have permission to update it.' }, { status: 404 });
    }

    const returnedWorkflow = await prisma.workflow.findUnique({ where: { id: workflowId } });

    return NextResponse.json(returnedWorkflow);
  } catch (error) {
    console.error(`[API /workflows/{id} PUT]`, error);
    return NextResponse.json({ error: 'Failed to update workflow.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.workspaceId || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER)) {
      return NextResponse.json({ error: 'Permission denied. Administrator or Manager access required.' }, { status: 403 });
  }
  
  try {
    const { workflowId } = params;
    
    const result = await prisma.workflow.deleteMany({
      where: { id: workflowId, workspaceId: session.user.workspaceId },
    });

    if (result.count === 0) {
        return NextResponse.json({ error: 'Workflow not found.' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[API /workflows/{id} DELETE]`, error);
    return NextResponse.json({ error: 'Failed to delete workflow.' }, { status: 500 });
  }
}
