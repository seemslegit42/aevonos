
'use server';
/**
 * @fileOverview Service for managing and retrieving third-party integration configurations.
 */
import prisma from '@/lib/prisma';
import { integrationManifests } from '@/config/integration-manifests';

/**
 * Retrieves the API credentials for a specific integration type within a workspace.
 * @param workspaceId The ID of the workspace.
 * @param integrationName The human-readable name of the integration (e.g., "Slack", "Stripe").
 * @returns The configuration details (e.g., API key) or null if not found/configured.
 */
export async function getIntegrationCredentials(workspaceId: string, integrationName: 'Slack' | 'Stripe' | 'Google Workspace') {
    const manifest = integrationManifests.find(m => m.name === integrationName);
    if (!manifest) {
        console.warn(`[Integration Service] No manifest found for integration: ${integrationName}`);
        return null;
    }

    const integration = await prisma.integration.findFirst({
        where: {
            workspaceId,
            integrationManifestId: manifest.id,
            status: 'active',
        },
        select: {
            configDetails: true,
        },
    });

    if (!integration || !integration.configDetails || typeof integration.configDetails !== 'object') {
        return null;
    }
    
    // The configDetails is a JSONB field. We expect an apiKey property for Slack.
    const apiKey = (integration.configDetails as { apiKey?: string }).apiKey;

    if (!apiKey) {
        return null;
    }

    return { apiKey };
}
