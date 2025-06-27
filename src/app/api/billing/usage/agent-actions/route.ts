import { NextResponse } from 'next/server';
import { getUsageDetails } from '@/ai/tools/billing-tools';

// GET /api/billing/usage/agent-actions
// Corresponds to the operationId `getAgentActionsUsage` in api-spec.md
export async function GET(request: Request) {
  try {
    // In a real application, you'd get the workspace/tenant ID from the auth token.
    // This function currently returns mock data as defined in the billing-tools.
    const usageDetails = await getUsageDetails();
    
    return NextResponse.json(usageDetails);

  } catch (error) {
    console.error('[API /billing/usage/agent-actions GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve usage details.' }, { status: 500 });
  }
}
