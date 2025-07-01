
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getUsageDetails } from '@/services/billing-service';
import { getServerActionSession } from '@/lib/auth';

// GET /api/billing/usage/agent-actions
export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getServerActionSession();

    // Call the non-billable version for UI display
    const usageDetails = await getUsageDetails(sessionUser.workspaceId);
    
    return NextResponse.json(usageDetails);

  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[API /billing/usage/agent-actions GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve usage details.' }, { status: 500 });
  }
}
