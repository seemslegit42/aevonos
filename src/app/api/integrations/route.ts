
import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';

// Based on IntegrationManifest schema from api-spec.md
const mockIntegrationManifests = [
    {
        id: 'f9d1b1e0-5a3d-4e8c-9b1a-2c6f8d7e4a5b',
        name: "Slack",
        description: "Connect your workspace to Slack for notifications and commands.",
        iconUrl: "https://placehold.co/100x100.png",
        authMethod: "oauth2",
        setupGuideUrl: "https://slack.com/help/articles/115005265703-Connect-your-workspace-to-Slack"
    },
    {
        id: 'a2c4b6e8-8d0f-4f6e-9c1b-3e7d9a8c5b4d',
        name: "Google Workspace",
        description: "Integrate with Google Calendar, Drive, and Gmail.",
        iconUrl: "https://placehold.co/100x100.png",
        authMethod: "oauth2",
        setupGuideUrl: "https://support.google.com/a/answer/6123543"
    },
    {
        id: 'c5e8d9f0-1a2b-4c3d-8e4f-6a7b8c9d0e1f',
        name: "Stripe",
        description: "Connect Stripe to manage payments and subscriptions.",
        iconUrl: "https://placehold.co/100x100.png",
        authMethod: "api_key",
        setupGuideUrl: "https://stripe.com/docs/keys"
    }
];

// Based on IntegrationConfigurationRequest schema from api-spec.md
const IntegrationConfigurationRequestSchema = z.object({
  integrationTypeId: z.string().uuid(),
  name: z.string(),
  configDetails: z.record(z.any()),
});

// Corresponds to operationId `listIntegrations`
export async function GET(request: Request) {
  try {
    return NextResponse.json(mockIntegrationManifests);
  } catch (error) {
    console.error('[API /integrations GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve integrations.' }, { status: 500 });
  }
}

// Corresponds to operationId `createIntegration`
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = IntegrationConfigurationRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid integration configuration.', issues: validation.error.issues }, { status: 400 });
    }

    const { integrationTypeId, name, configDetails } = validation.data;
    const manifest = mockIntegrationManifests.find(m => m.id === integrationTypeId);

    if (!manifest) {
        return NextResponse.json({ error: 'Invalid integrationTypeId.'}, { status: 400 });
    }

    const newInstance = {
        id: crypto.randomUUID(),
        tenantId: 1, // This would come from auth
        integrationTypeId: integrationTypeId,
        name: name,
        status: "active",
        configDetails: configDetails,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(newInstance, { status: 201 });

  } catch (error) {
    console.error('[API /integrations POST]', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create integration.' }, { status: 500 });
  }
}
