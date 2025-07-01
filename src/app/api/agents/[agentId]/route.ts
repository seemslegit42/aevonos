
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getServerActionSession } from '@/lib/auth';
import { AgentStatus, UserRole } from '@prisma/client';

const AgentUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(AgentStatus).optional(),
});

interface RouteParams {
  params: {
    agentId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getServerActionSession();
    const { agentId } = params;
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, workspaceId: sessionUser.workspaceId },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found.' }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(`[API /agents/{agentId} GET]`, error);
    return NextResponse.json({ error: 'Failed to retrieve agent.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getServerActionSession();
    const user = await prisma.user.findUnique({ where: { id: sessionUser.id }});
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER)) {
        return NextResponse.json({ error: 'Permission denied. Administrator or Manager access required.' }, { status: 403 });
    }
    
    const { agentId } = params;
    const body = await request.json();
    const validation = AgentUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid agent data.', issues: validation.error.issues }, { status: 400 });
    }

    // Verify the agent belongs to the user's workspace before updating
    const existingAgent = await prisma.agent.findFirst({
        where: { id: agentId, workspaceId: sessionUser.workspaceId }
    });
    if (!existingAgent) {
        return NextResponse.json({ error: 'Agent not found.' }, { status: 404 });
    }

    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: validation.data,
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    console.error(`[API /agents/{agentId} PUT]`, error);
    return NextResponse.json({ error: 'Failed to update agent.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const sessionUser = await getServerActionSession();
        const user = await prisma.user.findUnique({ where: { id: sessionUser.id }});
        if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER)) {
            return NextResponse.json({ error: 'Permission denied. Administrator or Manager access required.' }, { status: 403 });
        }
        
        const { agentId } = params;

        // Verify the agent belongs to the user's workspace before deleting
        const existingAgent = await prisma.agent.findFirst({
            where: { id: agentId, workspaceId: sessionUser.workspaceId }
        });
        if (!existingAgent) {
            return NextResponse.json({ error: 'Agent not found.' }, { status: 404 });
        }

        await prisma.agent.delete({
            where: { id: agentId },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error(`[API /agents/{agentId} DELETE]`, error);
        return NextResponse.json({ error: 'Failed to delete agent.' }, { status: 500 });
    }
}
