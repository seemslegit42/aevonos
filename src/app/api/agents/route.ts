'use server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { AgentStatus, UserRole } from '@prisma/client';
import { getAgentsForWorkspace } from '@/services/agent-service';
import cache from '@/lib/cache';

const AgentDeploymentRequestSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional().nullable(),
  configuration: z.record(z.any()).describe("JSON object containing agent-specific configuration.").optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { workspace } = await getAuthenticatedUser();
     if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
    }
    const agents = await getAgentsForWorkspace(workspace.id);
    return NextResponse.json(agents);
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('No session cookie'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /agents GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve agents.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, workspace } = await getAuthenticatedUser();

    if (!user || !workspace || (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER)) {
        return NextResponse.json({ error: 'Permission denied. Administrator or Manager access required.' }, { status: 403 });
    }

    const body = await request.json();
    const validation = AgentDeploymentRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid agent deployment request.', issues: validation.error.issues }, { status: 400 });
    }

    const { name, description, type } = validation.data;

    const newAgent = await prisma.agent.create({
        data: {
            name,
            type,
            description,
            status: AgentStatus.idle,
            workspaceId: workspace.id,
        }
    });
    
    await cache.del(`agents:${workspace.id}`);
    return NextResponse.json(newAgent, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('No session cookie'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    console.error('[API /agents POST]', error);
    return NextResponse.json({ error: 'Failed to deploy agent.' }, { status: 500 });
  }
}
