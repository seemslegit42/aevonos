
import { NextRequest, NextResponse } from 'next/server';
import { getUsageDetails } from '@/ai/tools/billing-tools';
import { getSession } from '@/lib/auth';

// GET /api/billing/usage/agent-actions
// Corresponds to the operationId `getAgentActionsUsage` in api-spec.md
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.workspaceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usageDetails = await getUsageDetails(session.workspaceId);
    
    return NextResponse.json(usageDetails);

  } catch (error) {
    console.error('[API /billing/usage/agent-actions GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve usage details.' }, { status: 500 });
  }
}
