
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerActionSession } from '@/lib/auth';
import { SecurityRiskLevel } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getServerActionSession();
    const alerts = await prisma.securityAlert.findMany({
        where: {
            workspaceId: sessionUser.workspaceId
        },
        orderBy: {
            timestamp: 'desc'
        }
    });
    
    return NextResponse.json(alerts);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /security/alerts GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve security alerts.' }, { status: 500 });
  }
}
