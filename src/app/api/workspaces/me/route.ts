
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { PlanTier } from '@prisma/client';

const WorkspaceUpdateSchema = z.object({
  name: z.string().min(1, 'Workspace name cannot be empty.').optional(),
  planTier: z.nativeEnum(PlanTier).optional(),
});


// Corresponds to operationId `getCurrentWorkspace`
export async function GET(request: NextRequest) {
  try {
    const { workspace } = await getAuthenticatedUser();

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
    }

    return NextResponse.json(workspace);
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('No session cookie'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /workspaces/me GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve workspace.' }, { status: 500 });
  }
}

// Corresponds to an extension of `getCurrentWorkspace` for updates
export async function PUT(request: NextRequest) {
  try {
    const { user, workspace } = await getAuthenticatedUser();
    if (!user || !workspace) {
      return NextResponse.json({ error: 'User or workspace not found.' }, { status: 404 });
    }
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
        where: { id: workspace.id },
        data: validation.data
    });

    // Invalidate the cache for this user's workspace
    await redis.del(`workspace:user:${user.id}`);

    return NextResponse.json(updatedWorkspace);

  } catch (error) {
     if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    console.error('[API /workspaces/me PUT]', error);
    return NextResponse.json({ error: 'Failed to update workspace.' }, { status: 500 });
  }
}
