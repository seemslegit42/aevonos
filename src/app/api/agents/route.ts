
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { AgentStatus } from '@prisma/client';

// Schema from api-spec.md for deploying an agent
const AgentDeploymentRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
  configuration: z.record(z.any()).describe("JSON object containing agent-specific configuration."),
});

// Corresponds to operationId `listAgents`
export async function GET(request: Request) {
  try {
    // In a real app, this would be filtered by the tenantId from the user's JWT.
    let agents = await prisma.agent.findMany();
    
    // Seed data if none exists, for demo purposes
    if (agents.length === 0) {
        await prisma.agent.createMany({
            data: [
                {
                    name: "Market Research Agent",
                    description: "Gathers and analyzes market data from various sources.",
                    status: AgentStatus.active,
                    lastActivityAt: new Date(Date.now() - 2 * 3600 * 1000),
                },
                {
                    name: "Customer Support Bot",
                    description: "Handles initial customer queries and triages support tickets.",
                    status: AgentStatus.idle,
                    assignedWorkflowId: "w1a2b3c4-d5e6-f789-0123-456789abcdef",
                    lastActivityAt: new Date(Date.now() - 30 * 60 * 1000),
                },
                {
                    name: "Social Media Scheduler",
                    description: "Schedules and posts content to social media channels.",
                    status: AgentStatus.error,
                    lastActivityAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
                }
            ]
        });
        agents = await prisma.agent.findMany();
    }
    
    return NextResponse.json(agents);
  } catch (error) {
    console.error('[API /agents GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve agents.' }, { status: 500 });
  }
}

// Corresponds to operationId `deployAgent`
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = AgentDeploymentRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid agent deployment request.', issues: validation.error.issues }, { status: 400 });
    }

    const { name, description } = validation.data;

    // In a real app, you'd associate this with the user's workspaceId
    const newAgent = await prisma.agent.create({
        data: {
            name,
            description,
            status: AgentStatus.idle,
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
