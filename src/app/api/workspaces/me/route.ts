
import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Corresponds to operationId `getCurrentWorkspace`
export async function GET(request: NextRequest) {
  // Protect the route
  const session = await getSession(request);
  if (!session?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: session.workspaceId },
    include: {
        members: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            }
        }
    }
  });

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
  }

  return NextResponse.json(workspace);
}
