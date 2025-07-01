
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerActionSession } from '@/lib/auth';
import { AgentStatus, UserRole } from '@prisma/client';

const AgentDeploymentRequestSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional().nullable(),
  configuration: z.record(z.any()).describe("JSON object containing agent-specific configuration.").optional(),
});

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getServerActionSession();
    const agents = await prisma.agent.findMany({
        where: {
            workspaceId: sessionUser.workspaceId,
        }
    });

    return NextResponse.json(agents);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /agents GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve agents.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getServerActionSession();
    const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });

    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER)) {
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
            workspaceId: sessionUser.workspaceId,
        }
    });

    return NextResponse.json(newAgent, { status: 201 });

  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    console.error('[API /agents POST]', error);
    return NextResponse.json({ error: 'Failed to deploy agent.' }, { status: 500 });
  }
}
