
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { IntegrationStatus } from '@prisma/client';


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
    const session = await auth();
    if (!session?.user?.workspaceId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { integrationId } = params;
        const integration = await prisma.integration.findFirst({
            where: { id: integrationId, workspaceId: session.user.workspaceId },
        });

        if (!integration) {
            return NextResponse.json({ error: 'Integration not found.' }, { status: 404 });
        }

        return NextResponse.json(integration);
    } catch (error) {
        console.error(`[API /integrations/{id} GET]`, error);
        return NextResponse.json({ error: 'Failed to retrieve integration.' }, { status: 500 });
    }
}

// Corresponds to operationId `updateIntegration`
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.workspaceId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { integrationId } = params;
        const body = await request.json();
        const validation = IntegrationUpdateRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid integration data.', issues: validation.error.issues }, { status: 400 });
        }

        const updatedIntegration = await prisma.integration.updateMany({
            where: { id: integrationId, workspaceId: session.user.workspaceId },
            data: validation.data,
        });

        if (updatedIntegration.count === 0) {
            return NextResponse.json({ error: 'Integration not found or you do not have permission to update it.' }, { status: 404 });
        }

        const returnedIntegration = await prisma.integration.findUnique({ where: { id: integrationId } });
        return NextResponse.json(returnedIntegration);

    } catch (error) {
        console.error('[API /integrations/{id} PUT]', error);
        if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update integration.' }, { status: 500 });
    }
}

// Corresponds to operationId `deleteIntegration`
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.workspaceId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { integrationId } = params;
        
        const result = await prisma.integration.deleteMany({
          where: { id: integrationId, workspaceId: session.user.workspaceId },
        });
    
        if (result.count === 0) {
            return NextResponse.json({ error: 'Integration not found.' }, { status: 404 });
        }
    
        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error(`[API /integrations/{id} DELETE]`, error);
        return NextResponse.json({ error: 'Failed to delete integration.' }, { status: 500 });
    }
}
