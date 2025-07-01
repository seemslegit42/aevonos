
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerActionSession } from '@/lib/auth';
import { integrationManifests } from '@/config/integration-manifests';
import { IntegrationStatus, UserRole } from '@prisma/client';

const IntegrationConfigurationRequestSchema = z.object({
  integrationTypeId: z.string().uuid(),
  name: z.string(),
  configDetails: z.record(z.any()),
});

// Corresponds to operationId `listIntegrations`
// This now returns the *configured* integrations for a workspace, not just the available manifests.
export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getServerActionSession();
    const configuredIntegrations = await prisma.integration.findMany({
      where: {
        workspaceId: sessionUser.workspaceId,
      },
    });

    // Map manifest data onto the configured integrations
    const manifestMap = new Map(integrationManifests.map(m => [m.id, m]));
    const responseData = configuredIntegrations.map(config => ({
        ...config,
        manifest: manifestMap.get(config.integrationManifestId) || null,
    }));

    return NextResponse.json(responseData);
  } catch (error) {
     if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /integrations GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve integrations.' }, { status: 500 });
  }
}

// Corresponds to operationId `createIntegration`
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getServerActionSession();
    const user = await prisma.user.findUnique({ where: { id: sessionUser.id }});
    if (!user || user.role !== UserRole.ADMIN) {
        return NextResponse.json({ error: 'Permission denied. Administrator access required.' }, { status: 403 });
    }
    
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
