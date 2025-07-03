
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { IntegrationStatus, UserRole } from '@prisma/client';


interface RouteParams {
  params: {
    integrationId: string;
  };
}

// Based on IntegrationConfigurationRequest schema from api-spec.md
const IntegrationUpdateRequestSchema = z.object({
  name: z.string().optional(),
  configDetails: z.record(z.any()).optional(),
  status: z.nativeEnum(IntegrationStatus).optional(),
});

// Corresponds to operationId `getIntegration`
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { workspace } = await getAuthenticatedUser();
        if (!workspace) {
            return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
        }
        const { integrationId } = params;
        const integration = await prisma.integration.findFirst({
            where: { id: integrationId, workspaceId: workspace.id },
        });

        if (!integration) {
            return NextResponse.json({ error: 'Integration not found.' }, { status: 404 });
        }

        return NextResponse.json(integration);
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error(`[API /integrations/{id} GET]`, error);
        return NextResponse.json({ error: 'Failed to retrieve integration.' }, { status: 500 });
    }
}

// Corresponds to operationId `updateIntegration`
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { user, workspace } = await getAuthenticatedUser();
        if (!user || !workspace || (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER)) {
            return NextResponse.json({ error: 'Permission denied. Administrator or Manager access required.' }, { status: 403 });
        }

        const { integrationId } = params;
        const body = await request.json();
        const validation = IntegrationUpdateRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid integration data.', issues: validation.error.issues }, { status: 400 });
        }

        const updatedIntegration = await prisma.integration.updateMany({
            where: { id: integrationId, workspaceId: workspace.id },
            data: validation.data,
        });

        if (updatedIntegration.count === 0) {
            return NextResponse.json({ error: 'Integration not found or you do not have permission to update it.' }, { status: 404 });
        }

        const returnedIntegration = await prisma.integration.findUnique({ where: { id: integrationId } });
        return NextResponse.json(returnedIntegration);

    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
        }
        console.error('[API /integrations/{id} PUT]', error);
        return NextResponse.json({ error: 'Failed to update integration.' }, { status: 500 });
    }
}

// Corresponds to operationId `deleteIntegration`
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { user, workspace } = await getAuthenticatedUser();
        if (!user || !workspace || (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER)) {
            return NextResponse.json({ error: 'Permission denied. Administrator or Manager access required.' }, { status: 403 });
        }

        const { integrationId } = params;
        
        const result = await prisma.integration.deleteMany({
          where: { id: integrationId, workspaceId: workspace.id },
        });
    
        if (result.count === 0) {
            return NextResponse.json({ error: 'Integration not found.' }, { status: 404 });
        }
    
        return new NextResponse(null, { status: 204 });

    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error(`[API /integrations/{id} DELETE]`, error);
        return NextResponse.json({ error: 'Failed to delete integration.' }, { status: 500 });
    }
}
