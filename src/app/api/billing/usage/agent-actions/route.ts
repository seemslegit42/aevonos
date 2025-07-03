
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getUsageDetails } from '@/services/billing-service';
import { getAuthenticatedUser } from '@/lib/firebase/admin';

// GET /api/billing/usage/agent-actions
export async function GET(request: NextRequest) {
  try {
    const { workspace } = await getAuthenticatedUser();
    
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
    }

    // Call the non-billable version for UI display
    const usageDetails = await getUsageDetails(workspace.id);
    
    return NextResponse.json(usageDetails);

  } catch (error) {
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('No session cookie'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /billing/usage/agent-actions GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve usage details.' }, { status: 500 });
  }
}
