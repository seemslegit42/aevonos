
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SecurityRiskLevel } from '@prisma/client';


// Based on the SecurityAlert Schema from api-spec.md
export async function GET(request: Request) {
  try {
    // In a real app, this would be filtered by the tenantId from the user's JWT.
    let alerts = await prisma.securityAlert.findMany();

    // Seed data if none exists, for demo purposes
    if (alerts.length === 0) {
        await prisma.securityAlert.createMany({
            data: [
                {
                    type: 'Anomalous Login',
                    explanation: 'Login from an unusual location (e.g., Russia) for this user, outside of typical work hours.',
                    riskLevel: SecurityRiskLevel.high,
                    timestamp: new Date(Date.now() - 3600 * 1000),
                    actionableOptions: ['Lock Account', 'Dismiss Alert', 'View Details'],
                },
                {
                    type: 'Permission Creep Detected',
                    explanation: 'User "Kyle D." was granted administrative privileges by an automated workflow, which deviates from established security policy.',
                    riskLevel: SecurityRiskLevel.medium,
                    timestamp: new Date(Date.now() - 24 * 3600 * 1000),
                    actionableOptions: ['Revoke Privileges', 'Audit Workflow', 'Dismiss Alert'],
                },
                {
                    type: 'Anomalous Workflow Execution',
                    explanation: 'Workflow "Client Data Export" attempted to send a file to an external, unrecognized email address.',
                    riskLevel: SecurityRiskLevel.critical,
                    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000),
                    actionableOptions: ['Halt Workflow', 'Quarantine Data', 'Investigate Run'],
                },
            ]
        });
        alerts = await prisma.securityAlert.findMany();
    }
    
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('[API /security/alerts GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve security alerts.' }, { status: 500 });
  }
}
