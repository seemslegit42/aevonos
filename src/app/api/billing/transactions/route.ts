
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getWorkspaceTransactions } from '@/services/ledger-service';
import { z } from 'zod';

const QuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional().default(20),
});

// GET /api/billing/transactions
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validation = QuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid query parameters.', issues: validation.error.issues }, { status: 400 });
    }

    const { limit } = validation.data;

    const transactions = await getWorkspaceTransactions(session.user.workspaceId, limit);
    
    return NextResponse.json(transactions);

  } catch (error) {
    console.error('[API /billing/transactions GET]', error);
    return NextResponse.json({ error: 'Failed to retrieve transaction history.' }, { status: 500 });
  }
}
