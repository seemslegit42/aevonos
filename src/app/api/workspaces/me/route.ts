
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { PlanTier } from '@prisma/client';

const WorkspaceUpdateSchema = z.object({
  name: z.string().min(1, 'Workspace name cannot be empty.').optional(),
  planTier: z.nativeEnum(PlanTier).optional(),
});


// Corresponds to operationId `getCurrentWorkspace`
export async function GET(request: NextRequest) {
  // Protect the route
  const session = await getSession(request);
  if (!session?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: session.workspaceId },
  });

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
  }

  return NextResponse.json(workspace);
}

// Corresponds to an extension of `getCurrentWorkspace` for updates
export async function PUT(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = WorkspaceUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.', issues: validation.error.issues }, { status: 400 });
    }
    
    // Ensure there's at least one field to update
    if (Object.keys(validation.data).length === 0) {
        return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
    }
    
    const updatedWorkspace = await prisma.workspace.update({
        where: { id: session.workspaceId },
        data: validation.data
    });

    return NextResponse.json(updatedWorkspace);

  } catch (error) {
    console.error('[API /workspaces/me PUT]', error);
     if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update workspace.' }, { status: 500 });
  }
}
