
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
    const alerts = await prisma.securityAlert.findMany({
        where: {
            workspaceId: session.workspaceId
        },
        orderBy: {
            timestamp: 'desc'
        }
    });
    
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('[API /security/alerts GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve security alerts.' }, { status: 500 });
  }
}
