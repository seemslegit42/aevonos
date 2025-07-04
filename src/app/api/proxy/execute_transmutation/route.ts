
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { transmuteCredits } from '@/services/ledger-service';
import { InsufficientCreditsError } from '@/lib/errors';

const ExecuteRequestSchema = z.object({
  quote: z.object({
    realWorldAmount: z.number(),
    currency: z.string(),
    vendor: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const { user, workspace } = await getAuthenticatedUser();
    if (!user || !workspace) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    
    const body = await request.json();
    const validation = ExecuteRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid execution request', issues: validation.error.issues }, { status: 400 });
    }
    
    const { realWorldAmount, currency, vendor } = validation.data.quote;
    
    const result = await transmuteCredits({
      amount: realWorldAmount,
      currency,
      vendor,
    }, workspace.id, user.id);
    
    return NextResponse.json(result);

  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
        return NextResponse.json({ error: error.message }, { status: 402 }); // Payment Required
    }
    console.error('[API /proxy/execute_transmutation]', error);
    const errorMessage = error instanceof Error ? error.message : "Transmutation execution failed.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
