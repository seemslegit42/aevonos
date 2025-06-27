
import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';

// Schema from api-spec.md for deploying an agent
const AgentDeploymentRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
  configuration: z.record(z.any()).describe("JSON object containing agent-specific configuration."),
});

const mockAgents = [
    {
        id: crypto.randomUUID(),
        tenantId: 1,
        name: "Market Research Agent",
        description: "Gathers and analyzes market data from various sources.",
        status: "active",
        assignedWorkflowId: null,
        lastActivityAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: crypto.randomUUID(),
        tenantId: 1,
        name: "Customer Support Bot",
        description: "Handles initial customer queries and triages support tickets.",
        status: "idle",
        assignedWorkflowId: "w1a2b3c4-d5e6-f789-0123-456789abcdef",
        lastActivityAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: crypto.randomUUID(),
        tenantId: 1,
        name: "Social Media Scheduler",
        description: "Schedules and posts content to social media channels.",
        status: "error",
        assignedWorkflowId: null,
        lastActivityAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    }
];

// Corresponds to operationId `listAgents`
export async function GET(request: Request) {
  try {
    // In a real app, these would be fetched from the database
    // and filtered by the tenantId from the user's JWT.
    return NextResponse.json(mockAgents);
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

    // In a real application, you'd deploy the agent (e.g., create a DB record, spin up a service).
    // For now, we return a mock response representing the newly deployed agent.
    const newAgent = {
        id: crypto.randomUUID(),
        tenantId: 1, // This would come from the auth token
        name,
        description,
        status: "idle",
        assignedWorkflowId: null,
        lastActivityAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(newAgent, { status: 201 });

  } catch (error) {
    console.error('[API /agents POST]', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to deploy agent.' }, { status: 500 });
  }
}
