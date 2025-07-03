
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { SecurityRiskLevel } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { workspace } = await getAuthenticatedUser();
    const alerts = await prisma.securityAlert.findMany({
        where: {
            workspaceId: workspace.id
        },
        orderBy: {
            timestamp: 'desc'
        }
    });
    
    return NextResponse.json(alerts);
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('No session cookie'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /security/alerts GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve security alerts.' }, { status: 500 });
  }
}
