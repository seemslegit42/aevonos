
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { getTransmutationQuote } from '@/services/ledger-service';

const QuoteRequestSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().optional().default('CAD'),
  vendor: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const { user, workspace } = await getAuthenticatedUser();
    if (!user || !workspace) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const validation = QuoteRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid quote request', issues: validation.error.issues }, { status: 400 });
    }
    
    const { amount, currency, vendor } = validation.data;
    
    const quote = await getTransmutationQuote({ amount, currency }, workspace.id);

    return NextResponse.json({ ...quote, vendor });

  } catch (error) {
    console.error('[API /proxy/initiate_transmutation]', error);
    const errorMessage = error instanceof Error ? error.message : "Failed to initiate transmutation.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
