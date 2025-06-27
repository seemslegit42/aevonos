
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { AgentStatus } from '@prisma/client';

const AgentDeploymentRequestSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional().nullable(),
  configuration: z.record(z.any()).describe("JSON object containing agent-specific configuration."),
});

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let agents = await prisma.agent.findMany({
        where: {
            workspaceId: session.workspaceId,
        }
    });

    if (agents.length === 0) {
      const statuses: AgentStatus[] = [AgentStatus.active, AgentStatus.idle, AgentStatus.processing, AgentStatus.paused, AgentStatus.error];
      await prisma.agent.createMany({
        data: [
          { name: 'Reputation Management', type: 'winston-wolfe', description: 'Solves online reputation problems.', status: statuses[Math.floor(Math.random() * statuses.length)], workspaceId: session.workspaceId },
          { name: 'Morale Monitor', type: 'kif-kroker', description: 'Monitors team communications for morale.', status: statuses[Math.floor(Math.random() * statuses.length)], workspaceId: session.workspaceId },
          { name: 'Compliance Scanner', type: 'sterileish', description: 'Scans logs for compliance issues.', status: statuses[Math.floor(Math.random() * statuses.length)], workspaceId: session.workspaceId },
          { name: 'Recruiting Assistant', type: 'rolodex', description: 'Analyzes candidates and generates outreach.', status: statuses[Math.floor(Math.random() * statuses.length)], workspaceId: session.workspaceId },
          { name: 'Security Analyst', type: 'lahey-surveillance', description: 'Investigates suspicious activity.', status: statuses[Math.floor(Math.random() * statuses.length)], workspaceId: session.workspaceId },
        ]
      });
      agents = await prisma.agent.findMany({ where: { workspaceId: session.workspaceId } });
    }


    return NextResponse.json(agents);
  } catch (error) {
    console.error('[API /agents GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve agents.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
            workspaceId: session.workspaceId,
        }
    });

    return NextResponse.json(newAgent, { status: 201 });

  } catch (error) {
    console.error('[API /agents POST]', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to deploy agent.' }, { status: 500 });
  }
}
