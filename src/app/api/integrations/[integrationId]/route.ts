
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';

interface RouteParams {
  params: {
    integrationId: string;
  };
}

const mockIntegrationInstance = {
    id: 'int-1234-uuid',
    tenantId: 1,
    integrationTypeId: 'f9d1b1e0-5a3d-4e8c-9b1a-2c6f8d7e4a5b', // Mock Slack integrationTypeId
    name: "My Marketing Slack",
    status: "active",
    configDetails: { webhookUrl: "https://hooks.slack.com/services/..." },
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
};

// Based on IntegrationConfigurationRequest schema from api-spec.md
const IntegrationConfigurationRequestSchema = z.object({
  integrationTypeId: z.string().uuid(),
  name: z.string(),
  configDetails: z.record(z.any()),
});

// Corresponds to operationId `getIntegration`
export async function GET(request: Request, { params }: RouteParams) {
  const { integrationId } = params;
  
  // In a real app, find by ID. Here, we return a mock if the ID format is ok.
  if (!integrationId) {
      return NextResponse.json({ error: 'Integration ID is required.' }, { status: 400 });
  }

  // To make it slightly more realistic, we'll "find" our mock instance
  if (integrationId === mockIntegrationInstance.id) {
    return NextResponse.json(mockIntegrationInstance);
  }

  return NextResponse.json({ error: 'Integration not found.' }, { status: 404 });
}

// Corresponds to operationId `updateIntegration`
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { integrationId } = params;
    const body = await request.json();
    const validation = IntegrationConfigurationRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid integration data.', issues: validation.error.issues }, { status: 400 });
    }

    if (integrationId !== mockIntegrationInstance.id) {
        return NextResponse.json({ error: 'Integration not found.' }, { status: 404 });
    }

    const updatedInstance = {
        ...mockIntegrationInstance,
        ...validation.data,
        updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedInstance);
  } catch (error) {
    console.error('[API /integrations/{id} PUT]', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update integration.' }, { status: 500 });
  }
}

// Corresponds to operationId `deleteIntegration`
export async function DELETE(request: Request, { params }: RouteParams) {
    const { integrationId } = params;

    if (integrationId !== mockIntegrationInstance.id) {
        return NextResponse.json({ error: 'Integration not found.' }, { status: 404 });
    }
    
    // In a real app, you would delete from the database.
    console.log(`Integration ${integrationId} deleted.`);

    return new NextResponse(null, { status: 204 });
}
