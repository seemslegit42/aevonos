
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { SecurityRiskLevel } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.workspaceId) {
    // This is a public-facing demo, so we'll allow access but use a default workspace.
    // In a real app with enforced login, you'd return 401.
    const firstWorkspace = await prisma.workspace.findFirst();
    if (!firstWorkspace) {
      return NextResponse.json({ error: 'No workspaces found.' }, { status: 404 });
    }
    session.workspaceId = firstWorkspace.id;
  }
  
  try {
    let alerts = await prisma.securityAlert.findMany({
        where: {
            workspaceId: session.workspaceId
        },
        orderBy: {
            timestamp: 'desc'
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
        alerts = await prisma.securityAlert.findMany({ where: { workspaceId: session.workspaceId }, orderBy: { timestamp: 'desc' } });
    }
    
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('[API /security/alerts GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve security alerts.' }, { status: 500 });
  }
}
