
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerActionSession } from '@/lib/auth';
import { integrationManifests } from '@/config/integration-manifests';
import { IntegrationStatus } from '@prisma/client';

// Based on IntegrationConfigurationRequest schema from api-spec.md
const IntegrationConfigurationRequestSchema = z.object({
  integrationTypeId: z.string().uuid(),
  name: z.string(),
  configDetails: z.record(z.any()),
});

// Corresponds to operationId `listIntegrations`
export async function GET(request: NextRequest) {
  try {
    // Returns the manifest of *available* integrations, not configured ones.
    return NextResponse.json(integrationManifests);
  } catch (error) {
    console.error('[API /integrations GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve integrations.' }, { status: 500 });
  }
}

// Corresponds to operationId `createIntegration`
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getServerActionSession();
    const body = await request.json();
    const validation = IntegrationConfigurationRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid integration configuration.', issues: validation.error.issues }, { status: 400 });
    }

    const { integrationTypeId, name, configDetails } = validation.data;
    const manifest = integrationManifests.find(m => m.id === integrationTypeId);

    if (!manifest) {
        return NextResponse.json({ error: 'Invalid integrationTypeId.'}, { status: 400 });
    }

    const newInstance = await prisma.integration.create({
        data: {
            workspaceId: sessionUser.workspaceId,
            integrationManifestId: integrationTypeId,
            name: name,
            status: IntegrationStatus.active,
            configDetails: configDetails,
        }
    });
    
    return NextResponse.json(newInstance, { status: 201 });

  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    console.error('[API /integrations POST]', error);
    return NextResponse.json({ error: 'Failed to create integration.' }, { status: 500 });
  }
}
