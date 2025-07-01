
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getUsageDetails } from '@/services/billing-service';
import { auth } from '@/auth';

// GET /api/billing/usage/agent-actions
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call the non-billable version for UI display
    const usageDetails = await getUsageDetails(session.user.workspaceId);
    
    return NextResponse.json(usageDetails);

  } catch (error) {
    console.error('[API /billing/usage/agent-actions GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve usage details.' }, { status: 500 });
  }
}
