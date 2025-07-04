
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { getEconomyStats } from '@/services/ledger-service';

export async function GET() {
  try {
    const { workspace } = await getAuthenticatedUser();
    
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
    }

    const stats = await getEconomyStats(workspace.id);

    return NextResponse.json(stats);

  } catch (error) {
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('No session cookie'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /workspaces/me/economy-stats GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve economy stats.' }, { status: 500 });
  }
}
