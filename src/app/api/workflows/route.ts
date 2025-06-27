
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema from api-spec.md for creating a workflow
const WorkflowCreationRequestSchema = z.object({
  name: z.string(),
  isActive: z.boolean().optional().default(true),
  triggerType: z.enum(['api', 'schedule', 'event']).optional().default('api'),
  definition: z.record(z.any()).describe("JSONB representation of the workflow graph (e.g., LangGraph JSON structure)."),
});

// GET /api/workflows
// Corresponds to operationId `listWorkflows`
export async function GET() {
  try {
    // In a real multi-tenant app, you'd filter by tenantId from the user's session.
    const workflows = await (prisma as any).workflow.findMany({
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

// POST /api/workflows
// Corresponds to operationId `createWorkflow`
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = WorkflowCreationRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid workflow definition.', issues: validation.error.issues }, { status: 400 });
    }

    const newWorkflow = await (prisma as any).workflow.create({
      data: validation.data,
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
