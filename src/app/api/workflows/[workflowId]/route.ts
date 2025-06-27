
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

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

// GET /api/workflows/{workflowId}
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { workflowId } = params;
    const workflow = await (prisma as any).workflow.findUnique({
      where: { uuid: workflowId },
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

// PUT /api/workflows/{workflowId}
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { workflowId } = params;
    const body = await request.json();
    const validation = WorkflowUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid workflow data.', issues: validation.error.issues }, { status: 400 });
    }

    const updatedWorkflow = await (prisma as any).workflow.update({
      where: { uuid: workflowId },
      data: validation.data,
    });

    return NextResponse.json(updatedWorkflow);
  } catch (error) {
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Workflow not found.' }, { status: 404 });
    }
    console.error(`[API /workflows/{id} PUT]`, error);
    return NextResponse.json({ error: 'Failed to update workflow.' }, { status: 500 });
  }
}

// DELETE /api/workflows/{workflowId}
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { workflowId } = params;
    await (prisma as any).workflow.delete({
      where: { uuid: workflowId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Workflow not found.' }, { status: 404 });
    }
    console.error(`[API /workflows/{id} DELETE]`, error);
    return NextResponse.json({ error: 'Failed to delete workflow.' }, { status: 500 });
  }
}
