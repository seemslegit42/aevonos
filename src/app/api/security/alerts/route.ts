
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Based on the SecurityAlert Schema from api-spec.md
export async function GET(request: Request) {
  try {
    const mockAlerts = [
      {
        id: crypto.randomUUID(),
        tenantId: 1,
        type: 'Anomalous Login',
        explanation: 'Login from an unusual location (e.g., Russia) for this user, outside of typical work hours.',
        riskLevel: 'high',
        timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
        actionableOptions: ['Lock Account', 'Dismiss Alert', 'View Details'],
      },
      {
        id: crypto.randomUUID(),
        tenantId: 1,
        type: 'Permission Creep Detected',
        explanation: 'User "Kyle D." was granted administrative privileges by an automated workflow, which deviates from established security policy.',
        riskLevel: 'medium',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        actionableOptions: ['Revoke Privileges', 'Audit Workflow', 'Dismiss Alert'],
      },
      {
        id: crypto.randomUUID(),
        tenantId: 1,
        type: 'Anomalous Workflow Execution',
        explanation: 'Workflow "Client Data Export" attempted to send a file to an external, unrecognized email address.',
        riskLevel: 'critical',
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        actionableOptions: ['Halt Workflow', 'Quarantine Data', 'Investigate Run'],
      },
    ];

    // In a real application, you would fetch these from a database,
    // filtered by the authenticated user's tenantId.
    return NextResponse.json(mockAlerts);
  } catch (error) {
    console.error('[API /security/alerts GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve security alerts.' }, { status: 500 });
  }
}
