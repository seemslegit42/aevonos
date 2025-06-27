
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { SecurityRiskLevel } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    let alerts = await prisma.securityAlert.findMany({
        where: {
            workspaceId: session.workspaceId
        }
    });

    if (alerts.length === 0) {
        await prisma.securityAlert.create({
            data: {
                type: 'Anomalous Login',
                explanation: 'Login from an unusual location (e.g., Russia) for this user, outside of typical work hours.',
                riskLevel: SecurityRiskLevel.high,
                timestamp: new Date(Date.now() - 3600 * 1000),
                actionableOptions: ['Lock Account', 'Dismiss Alert', 'View Details'],
                workspaceId: session.workspaceId,
            },
        });
        alerts = await prisma.securityAlert.findMany({ where: { workspaceId: session.workspaceId }});
    }
    
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('[API /security/alerts GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve security alerts.' }, { status: 500 });
  }
}
